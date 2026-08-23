/**
 * table.js — Desenha a tabela de fichas com edicao rapida na propria linha.
 *
 * Edicao rapida: preco, quantidade, cor e design sao editaveis directamente.
 * Tudo o resto (observacoes, codigo interno) tambem, atraves do formulario.
 */
(function (WF) {
  'use strict';

  var table = {};
  var tbody, foot, headRow, emptyState;

  var COLUMNS = [
    { key: 'color', label: 'Cor da ficha', sortable: true, className: 'col-color' },
    { key: 'product', label: 'Produto', sortable: true, className: 'col-product' },
    { key: 'price', label: 'Preco (CHF)', sortable: true, className: 'col-num' },
    { key: 'quantity', label: 'Qtd. a imprimir', sortable: true, className: 'col-num' },
    { key: 'design', label: 'Design (ficheiro grafico)', sortable: true, className: 'col-design' },
    { key: 'code', label: 'Codigo interno', sortable: false, className: 'col-code' },
    { key: 'notes', label: 'Observacoes', sortable: false, className: 'col-notes' },
    { key: 'total', label: 'Valor total', sortable: true, className: 'col-num' },
    { key: 'actions', label: 'Accoes', sortable: false, className: 'col-actions' }
  ];

  table.init = function () {
    tbody = document.getElementById('fichas-body');
    foot = document.getElementById('fichas-foot');
    headRow = document.getElementById('fichas-head-row');
    emptyState = document.getElementById('empty-state');

    renderHead();
    bindEvents();
    WF.store.subscribe(table.render);
  };

  // ------------------------------------------------------------------ cabecalho
  function renderHead() {
    headRow.innerHTML = COLUMNS.map(function (col) {
      if (!col.sortable) {
        return '<th class="' + col.className + '">' + WF.utils.escapeHtml(col.label) + '</th>';
      }
      return '<th class="' + col.className + '">' +
        '<button type="button" class="th-sort" data-sort="' + col.key + '">' +
        WF.utils.escapeHtml(col.label) + '<span class="th-sort__icon" aria-hidden="true"></span>' +
        '</button></th>';
    }).join('');
  }

  // ------------------------------------------------------------------ linhas
  function colorSelect(ficha) {
    var options = WF.config.colors.map(function (c) {
      return '<option value="' + c.key + '"' + (c.key === ficha.color ? ' selected' : '') + '>' +
        WF.utils.escapeHtml(c.label) + '</option>';
    }).join('');
    return '<label class="color-picker" style="--dot:' + WF.config.color(ficha.color).hex + '">' +
      '<span class="color-dot" aria-hidden="true"></span>' +
      '<select class="cell-input cell-input--color" data-field="color" aria-label="Cor da ficha de ' +
      WF.utils.escapeHtml(ficha.product) + '">' + options + '</select></label>';
  }

  function rowHtml(ficha) {
    var cfg = WF.config.color(ficha.color);
    var total = ficha.price * ficha.quantity;
    var e = WF.utils.escapeHtml;

    return '<tr class="ficha-row" data-id="' + ficha.id + '" data-color="' + ficha.color + '">' +
      '<td class="col-color" data-label="Cor">' + colorSelect(ficha) + '</td>' +

      '<td class="col-product" data-label="Produto">' +
        '<span class="product-name" title="' + e(cfg.label) + ' — ' + e(cfg.scope) + '">' + e(ficha.product) + '</span>' +
      '</td>' +

      '<td class="col-num" data-label="Preco (CHF)">' +
        '<input class="cell-input cell-input--num" type="number" min="0" step="0.05" inputmode="decimal" ' +
        'data-field="price" value="' + ficha.price.toFixed(2) + '" aria-label="Preco de ' + e(ficha.product) + '">' +
      '</td>' +

      '<td class="col-num" data-label="Qtd. a imprimir">' +
        '<input class="cell-input cell-input--num" type="number" min="0" step="10" inputmode="numeric" ' +
        'data-field="quantity" value="' + ficha.quantity + '" aria-label="Quantidade de ' + e(ficha.product) + '">' +
      '</td>' +

      '<td class="col-design" data-label="Design">' +
        '<input class="cell-input cell-input--text" type="text" data-field="design" ' +
        'value="' + e(ficha.design) + '" placeholder="ex. ' + WF.config.edition + '-' + cfg.slug + '-01_produto" ' +
        'aria-label="Design de ' + e(ficha.product) + '">' +
      '</td>' +

      '<td class="col-code" data-label="Codigo interno">' +
        '<input class="cell-input cell-input--text" type="text" data-field="code" ' +
        'value="' + e(ficha.code) + '" placeholder="—" aria-label="Codigo interno de ' + e(ficha.product) + '">' +
      '</td>' +

      '<td class="col-notes" data-label="Observacoes">' +
        '<input class="cell-input cell-input--text" type="text" data-field="notes" ' +
        'value="' + e(ficha.notes) + '" placeholder="—" aria-label="Observacoes de ' + e(ficha.product) + '">' +
      '</td>' +

      '<td class="col-num col-total" data-label="Valor total">' + WF.utils.money(total) + '</td>' +

      '<td class="col-actions" data-label="Accoes">' +
        '<div class="row-actions">' +
          '<button type="button" class="icon-btn" data-action="edit" title="Editar ficha" aria-label="Editar ' + e(ficha.product) + '">&#9998;</button>' +
          '<button type="button" class="icon-btn" data-action="duplicate" title="Duplicar ficha" aria-label="Duplicar ' + e(ficha.product) + '">&#10697;</button>' +
          '<button type="button" class="icon-btn icon-btn--danger" data-action="delete" title="Eliminar ficha" aria-label="Eliminar ' + e(ficha.product) + '">&#128465;</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }

  // ------------------------------------------------------------------ rodape
  function footHtml(list) {
    var s = WF.store.summary(list);
    return '<tr class="foot-row">' +
      '<th class="col-color">Totais</th>' +
      '<th class="col-product">' + WF.utils.int(s.total.products) + ' produto(s)</th>' +
      '<th class="col-num">—</th>' +
      '<th class="col-num">' + WF.utils.int(s.total.quantity) + '</th>' +
      '<th class="col-design">—</th>' +
      '<th class="col-code"></th>' +
      '<th class="col-notes"></th>' +
      '<th class="col-num col-total">' + WF.utils.moneyLabel(s.total.value) + '</th>' +
      '<th class="col-actions"></th>' +
    '</tr>';
  }

  // ------------------------------------------------------------------ render
  table.render = function () {
    var list = WF.store.visible();
    var view = WF.store.view();

    tbody.innerHTML = list.map(rowHtml).join('');
    foot.innerHTML = list.length ? footHtml(list) : '';
    emptyState.hidden = list.length > 0;

    if (!list.length) {
      var hasFilters = view.search || view.color !== 'todas';
      emptyState.querySelector('[data-empty-text]').textContent = hasFilters
        ? 'Nenhuma ficha corresponde a pesquisa ou ao filtro seleccionado.'
        : 'Ainda nao existem fichas. Comece por adicionar o primeiro produto.';
    }

    WF.utils.$$('.th-sort', headRow).forEach(function (btn) {
      var active = btn.getAttribute('data-sort') === view.sort;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('data-dir', active ? view.dir : '');
    });

    document.getElementById('result-count').textContent =
      list.length === WF.store.all().length
        ? WF.utils.int(list.length) + ' fichas'
        : WF.utils.int(list.length) + ' de ' + WF.utils.int(WF.store.all().length) + ' fichas';
  };

  // ------------------------------------------------------------------ eventos
  function bindEvents() {
    // Edicao rapida na celula (dispara ao sair do campo ou ao carregar Enter).
    tbody.addEventListener('change', function (event) {
      var input = event.target.closest('[data-field]');
      if (!input) return;
      var row = input.closest('.ficha-row');
      var patch = {};
      patch[input.getAttribute('data-field')] = input.value;
      WF.store.update(row.getAttribute('data-id'), patch);
    });

    tbody.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.matches('.cell-input')) {
        event.preventDefault();
        event.target.blur();
      }
    });

    tbody.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action]');
      if (!btn) return;
      var id = btn.closest('.ficha-row').getAttribute('data-id');
      var ficha = WF.store.get(id);
      if (!ficha) return;

      var action = btn.getAttribute('data-action');
      if (action === 'edit') {
        WF.form.open(ficha);
      } else if (action === 'duplicate') {
        var copy = Object.assign({}, ficha);
        delete copy.id; delete copy.createdAt; delete copy.updatedAt;
        copy.product = ficha.product + ' (copia)';
        copy.design = WF.model.suggestDesign(ficha.color, copy.product, WF.store.all());
        WF.store.add(copy);
        WF.ui.toast('Ficha duplicada.', { type: 'success' });
      } else if (action === 'delete') {
        WF.ui.confirm(
          'Eliminar ficha',
          'Quer mesmo eliminar a ficha "' + ficha.product + '"?',
          'Eliminar'
        ).then(function (ok) {
          if (!ok) return;
          WF.store.remove(id);
          WF.ui.toast('Ficha eliminada.', {
            type: 'info',
            action: { label: 'Anular', onClick: function () { WF.store.undoRemove(); } }
          });
        });
      }
    });

    headRow.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-sort]');
      if (!btn) return;
      var key = btn.getAttribute('data-sort');
      var view = WF.store.view();
      WF.store.setView({
        sort: key,
        dir: view.sort === key && view.dir === 'asc' ? 'desc' : 'asc'
      });
    });
  }

  WF.table = table;
})(window.WF = window.WF || {});
