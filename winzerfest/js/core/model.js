/**
 * model.js — Esquema de uma ficha, normalizacao e validacao.
 *
 * Uma "ficha" e o cartao/senha que sera impresso pela grafica.
 * Campos: cor, produto, preco (CHF), quantidade a imprimir, design,
 * codigo interno (opcional) e observacoes.
 */
(function (WF) {
  'use strict';

  var model = {};

  model.fields = ['id', 'color', 'product', 'price', 'quantity', 'design', 'code', 'notes', 'createdAt', 'updatedAt'];

  model.newId = function () {
    return 'f_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  };

  /** Converte qualquer entrada (texto de formulario, JSON importado) numa ficha valida. */
  model.normalize = function (raw) {
    raw = raw || {};
    var color = String(raw.color || '').toLowerCase();
    if (WF.config.colorKeys.indexOf(color) === -1) color = WF.config.colorKeys[0];

    var now = new Date().toISOString();
    return {
      id: raw.id || model.newId(),
      color: color,
      product: String(raw.product == null ? '' : raw.product).trim(),
      price: model.toPrice(raw.price),
      quantity: model.toQuantity(raw.quantity),
      design: String(raw.design == null ? '' : raw.design).trim(),
      code: String(raw.code == null ? '' : raw.code).trim(),
      notes: String(raw.notes == null ? '' : raw.notes).trim(),
      createdAt: raw.createdAt || now,
      updatedAt: raw.updatedAt || now
    };
  };

  /** Aceita "12,50", "12.50", " 12 " e devolve um numero com 2 casas. */
  model.toPrice = function (value) {
    if (typeof value === 'number' && isFinite(value)) return Math.round(value * 100) / 100;
    var n = parseFloat(String(value == null ? '' : value).replace(/\s/g, '').replace(',', '.'));
    if (!isFinite(n) || n < 0) return 0;
    return Math.round(n * 100) / 100;
  };

  model.toQuantity = function (value) {
    var n = parseInt(String(value == null ? '' : value).replace(/[^\d-]/g, ''), 10);
    if (!isFinite(n) || n < 0) return 0;
    return n;
  };

  /** Devolve uma lista de erros (vazia = ficha valida). */
  model.validate = function (ficha) {
    var errors = [];
    if (!ficha.product) errors.push('O nome do produto e obrigatorio.');
    if (WF.config.colorKeys.indexOf(ficha.color) === -1) errors.push('Cor de ficha invalida.');
    if (ficha.price < 0) errors.push('O preco nao pode ser negativo.');
    if (ficha.quantity < 0) errors.push('A quantidade nao pode ser negativa.');
    return errors;
  };

  /**
   * Sugere a proxima referencia de design para uma cor.
   * Formato: WF26-VER-03_vinho-tinto-75cl
   */
  model.suggestDesign = function (color, product, existing) {
    var cfg = WF.config.color(color);
    var prefix = WF.config.edition + '-' + cfg.slug + '-';
    var max = 0;
    (existing || []).forEach(function (f) {
      var m = String(f.design || '').match(new RegExp('^' + prefix + '(\\d+)'));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    var num = String(max + 1);
    while (num.length < 2) num = '0' + num;
    var slug = model.slugify(product) || 'ficha';
    return prefix + num + '_' + slug;
  };

  model.slugify = function (text) {
    var s = String(text == null ? '' : text);
    if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  WF.model = model;
})(window.WF = window.WF || {});
