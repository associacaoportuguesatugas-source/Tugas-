/**
 * seed.js — Catalogo inicial das fichas da Winzerfest.
 *
 * Precos e quantidades ficam a zero de proposito: sao preenchidos pela
 * organizacao. As referencias de design seguem o formato WF26-COR-NN_produto.
 * O amarelo fica preparado (sem produtos) para adicionar mais tarde.
 */
(function (WF) {
  'use strict';

  WF.seed = function () {
    var rows = [
      // ---- BRANCO: bebidas sem alcool + cerveja -------------------------
      ['branco', 'Cerveja'],
      ['branco', 'Refrigerantes / Sumos'],
      ['branco', 'Agua'],

      // ---- VERDE: vinhos ------------------------------------------------
      ['verde', 'Vinho tinto 75cl'],
      ['verde', 'Vinho tinto 50cl'],
      ['verde', 'Vinho tinto 1dl (copo)'],
      ['verde', 'Vinho branco 75cl'],
      ['verde', 'Vinho branco 50cl'],
      ['verde', 'Vinho branco 1dl (copo)'],
      ['verde', 'Vinho branco portugues 75cl'],
      ['verde', 'Vinho branco portugues 1dl (copo)'],
      ['verde', 'Vinho tinto portugues 75cl'],
      ['verde', 'Vinho tinto portugues 1dl (copo)'],

      // ---- LARANJA: comida ----------------------------------------------
      ['laranja', 'Sandes de porco no espeto'],
      ['laranja', 'Frango no churrasco'],
      ['laranja', 'Sardinha na brasa'],
      ['laranja', 'Tapas'],

      // ---- AZUL: drinks e cafe -------------------------------------------
      ['azul', 'Drinks'],
      ['azul', 'Caipirinha'],
      ['azul', 'Cafe']

      // ---- AMARELO: reservado para novos produtos -------------------------
    ];

    var counters = {};
    return rows.map(function (row) {
      var color = row[0];
      var product = row[1];
      counters[color] = (counters[color] || 0) + 1;
      var num = String(counters[color]);
      while (num.length < 2) num = '0' + num;
      var design = WF.config.edition + '-' + WF.config.color(color).slug + '-' + num + '_' + WF.model.slugify(product);
      return WF.model.normalize({
        color: color,
        product: product,
        price: 0,
        quantity: 0,
        design: design,
        code: '',
        notes: ''
      });
    });
  };

})(window.WF = window.WF || {});
