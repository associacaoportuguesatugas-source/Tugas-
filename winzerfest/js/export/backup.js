/**
 * backup.js — Copia de seguranca em JSON e importacao (JSON ou CSV).
 *
 * Os dados vivem no browser (localStorage). A copia JSON permite
 * transportar a lista para outro computador ou guardar no Drive/GitHub.
 */
(function (WF) {
  'use strict';

  WF.exportJson = function () {
    var payload = {
      app: 'winzerfest-fichas',
      version: 1,
      edition: WF.config.edition,
      exportedAt: new Date().toISOString(),
      fichas: WF.store.all()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    WF.utils.download(blob, 'winzerfest_backup_' + WF.utils.stamp() + '.json');
  };

  /** Le um ficheiro escolhido pelo utilizador e substitui a lista actual. */
  WF.importFile = function (file) {
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || '');
      var fichas;
      try {
        if (/\.json$/i.test(file.name)) {
          var parsed = JSON.parse(text);
          fichas = Array.isArray(parsed) ? parsed : parsed.fichas;
        } else {
          fichas = WF.parseCsv(text);
        }
      } catch (e) {
        WF.ui.toast('Nao foi possivel ler o ficheiro: ' + e.message, { type: 'error' });
        return;
      }

      if (!Array.isArray(fichas) || !fichas.length) {
        WF.ui.toast('O ficheiro nao continha fichas validas.', { type: 'error' });
        return;
      }

      WF.ui.confirm(
        'Importar fichas',
        'Vao ser importadas ' + fichas.length + ' fichas. A lista actual sera substituida.',
        'Importar'
      ).then(function (ok) {
        if (!ok) return;
        WF.store.replaceAll(fichas);
        WF.ui.toast(fichas.length + ' fichas importadas.', { type: 'success' });
      });
    };
    reader.onerror = function () {
      WF.ui.toast('Erro ao abrir o ficheiro.', { type: 'error' });
    };
    reader.readAsText(file, 'utf-8');
  };

})(window.WF = window.WF || {});
