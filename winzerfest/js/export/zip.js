/**
 * zip.js — Escritor ZIP minimo (metodo "store", sem compressao).
 *
 * Serve para gerar ficheiros .xlsx reais sem depender de bibliotecas
 * externas — a aplicacao continua a funcionar offline, sem internet.
 */
(function (WF) {
  'use strict';

  var crcTable = (function () {
    var table = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function encode(text) { return new TextEncoder().encode(text); }

  function dosDateTime(date) {
    var time = (date.getHours() << 11) | (date.getMinutes() << 5) | (Math.floor(date.getSeconds() / 2));
    var day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { time: time & 0xFFFF, date: day & 0xFFFF };
  }

  function writer(size) {
    var buffer = new Uint8Array(size);
    var offset = 0;
    return {
      buffer: buffer,
      u16: function (v) { buffer[offset++] = v & 0xFF; buffer[offset++] = (v >>> 8) & 0xFF; },
      u32: function (v) {
        buffer[offset++] = v & 0xFF; buffer[offset++] = (v >>> 8) & 0xFF;
        buffer[offset++] = (v >>> 16) & 0xFF; buffer[offset++] = (v >>> 24) & 0xFF;
      },
      bytes: function (b) { buffer.set(b, offset); offset += b.length; },
      get offset() { return offset; }
    };
  }

  /**
   * @param {Array<{name:string, content:string}>} files
   * @returns {Blob} ficheiro ZIP pronto a descarregar
   */
  WF.zip = function (files) {
    var stamp = dosDateTime(new Date());
    var entries = files.map(function (file) {
      var nameBytes = encode(file.name);
      var dataBytes = encode(file.content);
      return { nameBytes: nameBytes, dataBytes: dataBytes, crc: crc32(dataBytes) };
    });

    var localSize = entries.reduce(function (sum, e) { return sum + 30 + e.nameBytes.length + e.dataBytes.length; }, 0);
    var centralSize = entries.reduce(function (sum, e) { return sum + 46 + e.nameBytes.length; }, 0);
    var out = writer(localSize + centralSize + 22);

    entries.forEach(function (entry) {
      entry.offset = out.offset;
      out.u32(0x04034b50);        // assinatura do cabecalho local
      out.u16(20);                // versao necessaria
      out.u16(0x0800);            // flags: nomes em UTF-8
      out.u16(0);                 // metodo: store
      out.u16(stamp.time);
      out.u16(stamp.date);
      out.u32(entry.crc);
      out.u32(entry.dataBytes.length);
      out.u32(entry.dataBytes.length);
      out.u16(entry.nameBytes.length);
      out.u16(0);
      out.bytes(entry.nameBytes);
      out.bytes(entry.dataBytes);
    });

    var centralStart = out.offset;
    entries.forEach(function (entry) {
      out.u32(0x02014b50);        // assinatura do directorio central
      out.u16(20); out.u16(20);
      out.u16(0x0800);
      out.u16(0);
      out.u16(stamp.time);
      out.u16(stamp.date);
      out.u32(entry.crc);
      out.u32(entry.dataBytes.length);
      out.u32(entry.dataBytes.length);
      out.u16(entry.nameBytes.length);
      out.u16(0); out.u16(0); out.u16(0); out.u16(0);
      out.u32(0);
      out.u32(entry.offset);
      out.bytes(entry.nameBytes);
    });

    var centralEnd = out.offset;
    out.u32(0x06054b50);          // fim do directorio central
    out.u16(0); out.u16(0);
    out.u16(entries.length);
    out.u16(entries.length);
    out.u32(centralEnd - centralStart);
    out.u32(centralStart);
    out.u16(0);

    return new Blob([out.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

})(window.WF = window.WF || {});
