# Agenda Tuga — app separada

App de agenda pessoal (reuniões, tarefas, eventos e lembretes) da Associação
Portuguesa Tuga. **Não faz parte do site www.tugas.ch** — é uma aplicação à
parte, publicada como artifact privado no Claude:

https://claude.ai/code/artifact/5d80221a-4e9a-4a0b-9d77-c9cda0954e27

Este diretório guarda apenas o código-fonte (`agenda.html`), para backup e
futuras alterações.

## Importante

Este repositório é publicado pelo GitHub Pages a partir do branch `main`. Se
esta pasta for integrada em `main`, o ficheiro passa a estar acessível em
`www.tugas.ch/agenda-app/agenda.html`. Manter fora de `main` enquanto a agenda
for para uso privado.

## Como funciona

- Interface em português, tema claro e escuro.
- Tipos de entrada: reunião, tarefa, evento, lembrete.
- Campos: título, tipo, data, hora (opcional), local, notas.
- Calendário mensal com marcas por dia, filtros (hoje, próximos 7 dias,
  atrasadas, concluídas, por tipo) e pesquisa.
- Dados guardados no armazenamento do artifact (capacidade `db`), sincronizados
  entre telemóvel e computador. Sem ligação, o browser guarda localmente e
  envia para o servidor assim que voltar a ligar.

## Alterações

Editar `agenda.html` e voltar a publicar no mesmo URL do artifact acima
(o Claude publica com `url` = link do artifact para manter o mesmo endereço).
