/**
 * form.js — Formulario (modal) para adicionar e editar fichas.
 */
(function (WF) {
  'use strict';

  var form = {};
  var dialog, el, editingId = null;

  form.init = function () {
    dialog = document.getElementById('ficha-dialog');
    el = dialog.querySelector('form');

    fillColorOptions();

    el.addEventListener('submit', function (event) {
      event.preventDefault();
      submit();
    });

    dialog.querySelector('[data-suggest-design]').addEventListener('click', function () {
      el.design.value = WF.model.suggestDesign(el.color.value, el.product.value, WF.store.all());
    });

    dialog.querySelector('[data-cancel]').addEventListener('click', function () { dialog.close(); });

    el.color.addEventListener('change', function () {
      dialog.setAttribute('data-color', el.color.value);
      updateScopeHint();
    });
  };

  function fillColorOptions() {
    el.color.innerHTML = WF.config.colors.map(function (c) {
      return '<option value="' + c.key + '">' + WF.utils.escapeHtml(c.label) + '</option>';
    }).join('');
  }

  function updateScopeHint() {
    dialog.querySelector('[data-color-scope]').textContent = WF.config.color(el.color.value).scope;
  }

  /** Abre o formulario. Sem argumento = nova ficha. */
  form.open = function (ficha) {
    editingId = ficha ? ficha.id : null;
    dialog.querySelector('[data-dialog-title]').textContent = ficha ? 'Editar ficha' : 'Nova ficha';
    dialog.querySelector('[data-submit-label]').textContent = ficha ? 'Guardar alteracoes' : 'Adicionar ficha';

    var view = WF.store.view();
    var defaults = {
      color: view.color !== 'todas' ? view.color : WF.config.colorKeys[0],
      product: '', price: '', quantity: '', design: '', code: '', notes: ''
    };
    var data = ficha || defaults;

    el.color.value = data.color;
    el.product.value = data.product;
    el.price.value = ficha ? data.price.toFixed(2) : '';
    el.quantity.value = ficha ? data.quantity : '';
    el.design.value = data.design;
    el.code.value = data.code;
    el.notes.value = data.notes;

    dialog.setAttribute('data-color', el.color.value);
    updateScopeHint();
    showErrors([]);

    dialog.showModal();
    setTimeout(function () { el.product.focus(); }, 30);
  };

  function submit() {
    var data = {
      color: el.color.value,
      product: el.product.value,
      price: el.price.value,
      quantity: el.quantity.value,
      design: el.design.value,
      code: el.code.value,
      notes: el.notes.value
    };

    var candidate = WF.model.normalize(data);
    var errors = WF.model.validate(candidate);
    if (errors.length) { showErrors(errors); return; }

    if (!candidate.design) {
      candidate.design = WF.model.suggestDesign(candidate.color, candidate.product, WF.store.all());
    }

    if (editingId) {
      WF.store.update(editingId, candidate);
      WF.ui.toast('Ficha actualizada.', { type: 'success' });
    } else {
      WF.store.add(candidate);
      WF.ui.toast('Ficha adicionada.', { type: 'success' });
    }
    dialog.close();
  }

  function showErrors(errors) {
    var box = dialog.querySelector('[data-form-errors]');
    box.hidden = !errors.length;
    box.innerHTML = errors.map(function (e) {
      return '<li>' + WF.utils.escapeHtml(e) + '</li>';
    }).join('');
  }

  WF.form = form;
})(window.WF = window.WF || {});
