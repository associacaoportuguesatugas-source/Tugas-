/**
 * build-ficheiro-unico.js — junta a aplicacao num unico ficheiro HTML.
 *
 * Uso:  node build-ficheiro-unico.js
 * Cria: winzerfest-app-completo.html  (abrir com duplo clique, sem mais nada)
 *
 * A versao normal (index.html + css/ + js/) continua a ser a de trabalho;
 * esta serve para enviar ou copiar a aplicacao como um so ficheiro.
 */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = (p) => fs.readFileSync(path.join(dir, p), 'utf8');

const html = read('index.html');

// Ordem de carregamento retirada do proprio index.html
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
const jsFiles = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);

const css = cssFiles.map((f) => '/* ===== ' + f + ' ===== */\n' + read(f)).join('\n');
const js = jsFiles.map((f) => '/* ===== ' + f + ' ===== */\n' + read(f)).join('\n');

const body = html
  .slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('</body>'))
  .replace(/\s*<script src="[^"]+"><\/script>/g, '')
  .replace(/\s*<!-- (Nucleo|Exportacoes|Interface) -->/g, '');

const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'))
  .replace(/\s*<link rel="stylesheet" href="[^"]+">/g, '');

const out = '<!DOCTYPE html>\n<html lang="pt" data-theme="light">\n' +
  head + '<style>\n' + css + '\n</style>\n</head>\n<body>\n' +
  body + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n';

fs.writeFileSync(path.join(dir, 'winzerfest-app-completo.html'), out);
console.log('Criado: winzerfest-app-completo.html (' + Math.round(out.length / 1024) + ' KB)');

// Versao sem <html>/<head>/<body>, para publicar como pagina (Artifact).
if (process.argv[2]) {
  fs.writeFileSync(process.argv[2],
    head.replace('<head>', '').trim() + '\n<style>\n' + css + '\n</style>\n' + body + '\n<script>\n' + js + '\n</script>\n');
  console.log('Criado: ' + process.argv[2]);
}
