# Winzerfest — Gestor de Fichas

Aplicação web local para criar e organizar todas as fichas (senhas) da Winzerfest
antes de as enviar para a gráfica.

Não precisa de instalação, servidor, internet nem base de dados: é HTML, CSS e
JavaScript simples. Basta abrir o ficheiro `index.html` num browser
(Chrome, Edge, Firefox ou Safari).

```
winzerfest/index.html   ← abrir este ficheiro
```

Os dados ficam guardados automaticamente no próprio browser (localStorage).
Para levar a lista para outro computador, use **Exportar → Cópia de segurança (JSON)**
e depois **Importar** no outro computador.

---

## O que a aplicação faz

**Tabela de fichas** com as colunas pedidas:
cor da ficha · produto · preço em francos (CHF) · quantidade a imprimir ·
design (nome/referência do ficheiro gráfico) · código interno (opcional) ·
observações · valor total da linha.

**Categorias por cor** (já pré-carregadas):

| Cor | Conteúdo |
|---|---|
| Branco | Cerveja, refrigerantes ou sumos e água |
| Verde | Vinho tinto 75cl / 50cl / 1dl copo · vinho branco 75cl / 50cl / 1dl copo · vinho branco português 75cl e 1dl copo · vinho tinto português 75cl e 1dl copo |
| Laranja | Sandes de porco no espeto, frango no churrasco, sardinha na brasa, tapas |
| Azul | Drinks, caipirinha, café |
| Amarelo | Reservado — preparado para adicionar produtos mais tarde |

**Funcionalidades**

- Adicionar, editar, duplicar e eliminar produtos (com opção de *anular* a eliminação).
- Alteração rápida directamente na tabela: preço, quantidade, cor da ficha, design,
  código e observações. Cada alteração é guardada automaticamente.
- Ordenar por cor, produto, preço, quantidade, design ou valor total
  (clicando no cabeçalho da coluna ou pelo menu "Ordenar por").
- Filtrar por cor e pesquisar em qualquer campo (atalho: tecla `/`).
- Cada linha aparece colorida conforme a cor da ficha.
- Resumo automático: total de produtos, total de fichas por cor, total de fichas a
  imprimir e valor total previsto (preço × quantidade). O resumo acompanha o filtro activo.
- Tema claro e escuro.
- Atalho `Ctrl/Cmd + N` para nova ficha.

**Referências de design**

O botão *Sugerir* (e o preenchimento automático) gera referências no formato:

```
WF26-VER-01_vinho-tinto-75cl
 │    │   │  └── nome do produto
 │    │   └───── número sequencial dentro da cor
 │    └───────── cor (BRA, VER, LAR, AZU, AMA)
 └────────────── edição (definida em js/core/config.js)
```

O campo aceita qualquer texto — pode escrever o nome real do ficheiro gráfico
(ex.: `ficha_vinho_tinto_75cl.pdf`).

**Exportação**

| Formato | Conteúdo |
|---|---|
| Excel (`.xlsx`) | Tabela completa com linhas coloridas, formatos numéricos, fórmula do valor total e o resumo por cor no fim. Ficheiro Excel verdadeiro, gerado sem bibliotecas externas. |
| PDF | Abre a lista final para a gráfica na caixa de impressão do browser — escolha "Guardar como PDF". |
| CSV | Separador `;` e UTF‑8 com BOM (abre directamente no Excel). Só dados, para reimportar. |
| JSON | Cópia de segurança completa (para guardar ou transportar). |

A exportação usa sempre **o que está visível** na tabela: se tiver um filtro ou
pesquisa activa, exporta apenas essas fichas.

**Lista para a gráfica**

O botão *Lista para a grafica* abre uma folha organizada por cor, com produto,
preço, quantidade, design, código e observações, os totais de cada cor, o resumo
final e espaço para assinatura. Pronta a imprimir ou a guardar em PDF.

---

## Estrutura do código

Código organizado por camadas, pensado para crescer (por exemplo, para uma futura
gestão completa da Winzerfest: bares, turnos, stock, contas).

```
winzerfest/
├── index.html              Estrutura da página (sem lógica)
├── css/
│   ├── base.css            Tokens de design (cores, espaços, temas) e layout
│   ├── components.css      Botões, filtros, tabela, resumo, diálogos, avisos
│   └── print.css           Lista para a gráfica / impressão / PDF
└── js/
    ├── core/
    │   ├── config.js       Cores, categorias, edição, chaves de armazenamento
    │   ├── model.js        Esquema da ficha, normalização, validação, referências
    │   ├── seed.js         Catálogo inicial da Winzerfest
    │   ├── store.js        Estado, persistência, CRUD, filtros e resumos
    │   ├── utils.js        Formatação (CHF, datas), atalhos de DOM, downloads
    │   └── ui.js           Avisos (toasts) e caixa de confirmação
    ├── export/
    │   ├── zip.js          Escritor ZIP mínimo (para o .xlsx)
    │   ├── xlsx.js         Geração do ficheiro Excel
    │   ├── csv.js          Exportar e importar CSV
    │   ├── print.js        Lista para a gráfica e exportação PDF
    │   └── backup.js       Cópia de segurança JSON e importação
    ├── features/
    │   ├── table.js        Tabela e edição rápida na linha
    │   ├── summary.js      Resumo automático
    │   ├── toolbar.js      Pesquisa, filtros e ordenação
    │   └── form.js         Formulário de adicionar/editar
    └── app.js              Arranque e ligação dos botões principais
```

Princípios seguidos:

- **Uma fonte de verdade** (`store.js`). Qualquer módulo altera dados através do
  store e a interface volta a desenhar-se sozinha.
- **Dados de negócio separados da lógica** (`config.js`, `seed.js`): mudar de
  edição, acrescentar uma cor ou mudar o catálogo não obriga a mexer no resto.
- **Sem dependências externas**: funciona offline e não envelhece com bibliotecas.
- **Persistência isolada**: para passar a uma base de dados ou API, basta
  reescrever `load`/`save` em `store.js`.

### Como adicionar uma nova cor de ficha

Acrescentar uma entrada em `WF.config.colors` (`js/core/config.js`) com
`key`, `label`, `slug`, `scope` e as cores `hex`, `accent`, `tint`, `tintDark`, `ink`;
e as variáveis `--row-<key>` / `--line-<key>` em `css/components.css`.
Filtros, resumo, tabela, Excel e lista para a gráfica passam a incluí-la automaticamente.

### Como mudar a edição (ano)

Alterar `edition` em `js/core/config.js` (ex.: `WF27`). Passa a ser usada nas novas
referências de design e no cabeçalho da lista para a gráfica.
