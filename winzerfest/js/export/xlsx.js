/**
 * xlsx.js — Exportacao para Excel (.xlsx real, sem bibliotecas externas).
 *
 * Gera as partes XML minimas de um livro OOXML e empacota-as com WF.zip.
 * As linhas ficam coloridas conforme a cor da ficha e o valor total e
 * escrito como formula, para poder ser recalculado dentro do Excel.
 */
(function (WF) {
  'use strict';

  var HEADERS = [
    'Cor da ficha', 'Produto', 'Preco (CHF)', 'Quantidade a imprimir',
    'Design (ficheiro grafico)', 'Codigo interno', 'Observacoes', 'Valor total (CHF)'
  ];

  var WIDTHS = [16, 34, 14, 22, 34, 18, 40, 18];

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function colLetter(index) {
    var letter = '';
    index += 1;
    while (index > 0) {
      var rest = (index - 1) % 26;
      letter = String.fromCharCode(65 + rest) + letter;
      index = Math.floor((index - 1) / 26);
    }
    return letter;
  }

  function cellText(ref, style, value) {
    return '<c r="' + ref + '" s="' + style + '" t="inlineStr"><is><t xml:space="preserve">' + esc(value) + '</t></is></c>';
  }
  function cellNumber(ref, style, value) {
    return '<c r="' + ref + '" s="' + style + '"><v>' + (Number(value) || 0) + '</v></c>';
  }
  function cellFormula(ref, style, formula, cached) {
    return '<c r="' + ref + '" s="' + style + '"><f>' + formula + '</f><v>' + (Number(cached) || 0) + '</v></c>';
  }

  /**
   * Indices de estilo:
   *  0 normal | 1 cabecalho | 2 negrito | 3 dinheiro negrito | 4 inteiro negrito
   *  por cor (i de 0..4): 5+i*3 texto, 6+i*3 dinheiro, 7+i*3 inteiro
   */
  function styleFor(colorKey, kind) {
    var i = WF.config.colorKeys.indexOf(colorKey);
    if (i === -1) i = 0;
    var base = 5 + i * 3;
    return kind === 'money' ? base + 1 : (kind === 'int' ? base + 2 : base);
  }

  function stylesXml() {
    var fills = [
      '<fill><patternFill patternType="none"/></fill>',
      '<fill><patternFill patternType="gray125"/></fill>',
      '<fill><patternFill patternType="solid"><fgColor rgb="FF1F2A44"/><bgColor indexed="64"/></patternFill></fill>'
    ];
    WF.config.colors.forEach(function (c) {
      fills.push('<fill><patternFill patternType="solid"><fgColor rgb="FF' +
        c.tint.replace('#', '').toUpperCase() + '"/><bgColor indexed="64"/></patternFill></fill>');
    });

    var xfs = [
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
      '<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>',
      '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>',
      '<xf numFmtId="4" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyNumberFormat="1"/>',
      '<xf numFmtId="3" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyNumberFormat="1"/>'
    ];
    WF.config.colors.forEach(function (c, i) {
      var fillId = 3 + i;
      xfs.push('<xf numFmtId="0" fontId="0" fillId="' + fillId + '" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>');
      xfs.push('<xf numFmtId="4" fontId="0" fillId="' + fillId + '" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyNumberFormat="1"/>');
      xfs.push('<xf numFmtId="3" fontId="0" fillId="' + fillId + '" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyNumberFormat="1"/>');
    });

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<fonts count="3">' +
        '<font><sz val="11"/><name val="Calibri"/></font>' +
        '<font><b/><sz val="11"/><name val="Calibri"/></font>' +
        '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +
      '</fonts>' +
      '<fills count="' + fills.length + '">' + fills.join('') + '</fills>' +
      '<borders count="2">' +
        '<border><left/><right/><top/><bottom/><diagonal/></border>' +
        '<border><left style="thin"><color rgb="FFD8DEE9"/></left><right style="thin"><color rgb="FFD8DEE9"/></right>' +
        '<top style="thin"><color rgb="FFD8DEE9"/></top><bottom style="thin"><color rgb="FFD8DEE9"/></bottom><diagonal/></border>' +
      '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="' + xfs.length + '">' + xfs.join('') + '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>';
  }

  function sheetXml(list) {
    var rows = [];
    var r = 1;

    rows.push('<row r="' + r + '" ht="28" customHeight="1">' + HEADERS.map(function (h, i) {
      return cellText(colLetter(i) + r, 1, h);
    }).join('') + '</row>');

    list.forEach(function (f) {
      r += 1;
      var cfg = WF.config.color(f.color);
      var text = styleFor(f.color, 'text');
      rows.push('<row r="' + r + '">' +
        cellText('A' + r, text, cfg.label) +
        cellText('B' + r, text, f.product) +
        cellNumber('C' + r, styleFor(f.color, 'money'), f.price) +
        cellNumber('D' + r, styleFor(f.color, 'int'), f.quantity) +
        cellText('E' + r, text, f.design) +
        cellText('F' + r, text, f.code) +
        cellText('G' + r, text, f.notes) +
        cellFormula('H' + r, styleFor(f.color, 'money'), 'C' + r + '*D' + r, f.price * f.quantity) +
      '</row>');
    });

    var data = WF.store.summary(list);
    r += 2;
    rows.push('<row r="' + r + '">' + cellText('A' + r, 2, 'RESUMO') + '</row>');
    r += 1;
    rows.push('<row r="' + r + '">' +
      cellText('A' + r, 2, 'Cor') + cellText('B' + r, 2, 'Produtos') +
      cellText('C' + r, 2, '') + cellText('D' + r, 2, 'Fichas a imprimir') +
      cellText('E' + r, 2, '') + cellText('F' + r, 2, '') + cellText('G' + r, 2, '') +
      cellText('H' + r, 2, 'Valor previsto (CHF)') + '</row>');

    WF.config.colors.forEach(function (c) {
      var bucket = data.byColor[c.key];
      r += 1;
      rows.push('<row r="' + r + '">' +
        cellText('A' + r, styleFor(c.key, 'text'), c.label) +
        cellNumber('B' + r, styleFor(c.key, 'int'), bucket.products) +
        cellText('C' + r, styleFor(c.key, 'text'), '') +
        cellNumber('D' + r, styleFor(c.key, 'int'), bucket.quantity) +
        cellText('E' + r, styleFor(c.key, 'text'), '') +
        cellText('F' + r, styleFor(c.key, 'text'), '') +
        cellText('G' + r, styleFor(c.key, 'text'), '') +
        cellNumber('H' + r, styleFor(c.key, 'money'), Math.round(bucket.value * 100) / 100) +
      '</row>');
    });

    r += 1;
    rows.push('<row r="' + r + '">' +
      cellText('A' + r, 2, 'TOTAL') +
      cellNumber('B' + r, 4, data.total.products) +
      cellText('C' + r, 2, '') +
      cellNumber('D' + r, 4, data.total.quantity) +
      cellText('E' + r, 2, '') + cellText('F' + r, 2, '') + cellText('G' + r, 2, '') +
      cellNumber('H' + r, 3, Math.round(data.total.value * 100) / 100) +
    '</row>');

    var cols = WIDTHS.map(function (w, i) {
      return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>';
    }).join('');

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
      '<cols>' + cols + '</cols>' +
      '<sheetData>' + rows.join('') + '</sheetData>' +
      '</worksheet>';
  }

  /** Exporta a lista indicada (ou a vista actual) para .xlsx. */
  WF.exportXlsx = function (list) {
    list = list || WF.store.visible();

    var files = [
      {
        name: '[Content_Types].xml',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
          '</Types>'
      },
      {
        name: '_rels/.rels',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>'
      },
      {
        name: 'xl/workbook.xml',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<sheets><sheet name="Fichas Winzerfest" sheetId="1" r:id="rId1"/></sheets></workbook>'
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
          '</Relationships>'
      },
      { name: 'xl/styles.xml', content: stylesXml() },
      { name: 'xl/worksheets/sheet1.xml', content: sheetXml(list) }
    ];

    WF.utils.download(WF.zip(files), WF.utils.exportName('xlsx'));
  };

})(window.WF = window.WF || {});
