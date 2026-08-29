# TikTok Manager — Associação Portuguesa TUGA

Sistema de gestão de conteúdo TikTok para a Associação Portuguesa TUGA (Klingnau, Aargau, Suíça). Este ficheiro é a fonte de verdade para qualquer sessão (manual ou agendada) que gere, reveja ou publique conteúdo.

## Estado atual

**MODO: APROVAÇÃO.** Nenhum conteúdo é agendado ou publicado sem confirmação explícita do responsável da Associação. Não existe ainda nenhuma automação recorrente (Routine/trigger) a correr — cada ciclo é iniciado manualmente por agora.

## Integração TikTok (confirmada)

- **Plataforma de publicação**: Postiz.
- **Integração ativa**: "Associação Tuga", `integration_id = cmr6zg7ee03dylh0yl2seb9e0`, conta `tuga_associacao`.
- Existe também uma ligação direta Higgsfield→TikTok (`connector_id = a6a2be72-0366-48f0-822d-7ab676923ccc`), mas **não é usada** para publicar — foi confirmado por análise do histórico real da Postiz que 100% das 264 publicações passadas usaram a integração acima. Não usar a ligação Higgsfield para publicar, para evitar duplicação ou conflito de contas.
- Formatação de legenda: parágrafos em tags `<p>...</p>` (ver `references/postiz-format.md` da skill `tuga-social-media`).

## Achado crítico (analisado em 2026-08-29)

Do histórico importado para `data/history.json` (264 publicações no Postiz):
- 230 em **ERROR** (87%)
- 27 **PUBLISHED**
- 7 em **QUEUE**

A API de listagem de posts da Postiz não devolve informação de media anexado. A hipótese mais provável do elevado número de erros é **falta de vídeo/imagem anexado** — o TikTok não aceita publicação só de texto via `DIRECT_POST`. **Antes de agendar qualquer publicação nova, confirmar sempre que existe um ficheiro de media válido anexado no pedido à Postiz.** Se voltarem a aparecer erros em massa depois de garantir isso, investigar outras causas (formato de vídeo, duração, definições de conta) antes de continuar a agendar mais conteúdo.

## Origem do vídeo/imagem (decisão do responsável, 2026-08-29)

Combinação dos dois métodos:
- **Filmagem real**: eventos, bastidores, equipa, patrocinadores — alguém da Associação filma e carrega o ficheiro. O sistema prepara guião, texto no ecrã, legenda, hashtags e horário; a publicação só é agendada depois de o ficheiro real estar disponível.
- **Geração por IA (Higgsfield)**: para conteúdos informativos/curiosidades quando não há filmagem disponível, usar as ferramentas `generate_video`/`generate_image` do Higgsfield.

## Localização dos dados

Tudo dentro de `tiktok-manager/` neste repositório (decisão do responsável — não um repositório separado):

- `SPEC.md` — este ficheiro.
- `data/history.json` — histórico de publicações. As primeiras 264 entradas foram importadas diretamente da Postiz (histórico real da conta) em 2026-08-29; os campos de categoria/tema/hook/métricas dessas entradas antigas estão a `null` porque essa informação não existia estruturada antes deste sistema. Publicações novas devem preencher todos os campos.
- `data/calendar.json` — fila de publicações preparadas (rascunho → pendente de aprovação → aprovado → agendado → publicado).

## Regras de conteúdo (resumo operacional)

- **3 publicações por dia**, distribuídas ao longo do dia (não seguidas), com estrutura de referência:
  1. Conteúdo útil/cultural/informativo/entretenimento
  2. Associação/evento/comunidade/bastidores/interação
  3. Conteúdo forte para engagement, evento ou patrocinador
  Esta distribuição pode mudar com os dados de desempenho reais.
- **Idioma**: português de Portugal por predefinição. Alemão suíço/adequado quando o conteúdo é dirigido a empresas, patrocinadores ou público suíço. Nunca português do Brasil em comunicação oficial.
- **Categorias** (rodar entre elas, não repetir a mesma em publicações consecutivas): Associação TUGA; Eventos organizados/apoiados; Cultura portuguesa; Portugal e Suíça; Vida da comunidade portuguesa na Suíça; Curiosidades sobre Portugal; Gastronomia portuguesa; Humor adequado à comunidade; Informações úteis para portugueses na Suíça; Divulgação de patrocinadores e parceiros; Bastidores dos eventos; Preparação da Winzerfest Döttingen; Convites para eventos; Agradecimentos públicos; Conteúdos para gerar comentários/interação.
- **Patrocinadores**: nunca inventar informação — usar apenas factos já confirmados/publicados (ex. os textos já validados em `index.html` do repositório do site) ou fornecidos diretamente pelo responsável. Publicações sobre patrocinadores têm **aprovação obrigatória** sempre, mesmo depois de ativado o modo automático.
- **Eventos**: aumentar progressivamente a frequência de conteúdo à medida que a Winzerfest Döttingen (2–4 outubro 2026) se aproxima, variando o ângulo (comida, bebida, atrações, localização, horários, equipa, parceiros, bastidores, contagem decrescente) — nunca repetir o mesmo anúncio.
- **Anti-repetição**: antes de criar uma nova publicação, verificar `data/calendar.json` e `data/history.json` para não repetir hooks, textos, vídeos, ou saturar o mesmo patrocinador; não publicar temas demasiado semelhantes em dias consecutivos. É permitido reaproveitar uma ideia que resultou bem, mas sempre numa versão nova.
- **Segurança**: nunca publicar informação pessoal privada, acusações, conteúdo discriminatório ou político-partidário, informação não confirmada, ou preços/datas/condições de eventos sem confirmação. Nunca responder agressivamente a comentários — sinalizar comentários problemáticos para revisão humana.

## Limitação conhecida: analytics reais

Nenhuma das integrações disponíveis (Postiz, Higgsfield) expõe métricas reais do TikTok (visualizações, likes, comentários, partilhas, guardados, seguidores obtidos, tempo médio de visualização, taxa de conclusão). Estes valores têm de ser introduzidos manualmente em `data/history.json` pelo responsável (ex. a partir do TikTok Analytics) para que a análise de desempenho e a otimização de horários/temas/hooks possa funcionar com dados reais. Sem isto, as decisões de horário/categoria seguem apenas boas práticas gerais, não dados próprios da conta.

## Fluxo de trabalho (modo aprovação)

1. Gerar 3 rascunhos para o dia, com todos os campos exigidos (tema, objetivo, hook, guião, texto no vídeo, descrição, CTA, hashtags, música, sugestão visual, horário, categoria), guardando em `data/calendar.json` com `status: "pending_approval"`.
2. Apresentar os 3 rascunhos ao responsável para revisão.
3. Só depois de aprovação explícita — e só quando existir um ficheiro de media real anexado — agendar via Postiz (`integrationSchedulePostTool`, `integration_id = cmr6zg7ee03dylh0yl2seb9e0`).
4. Atualizar o registo em `data/calendar.json`/`data/history.json` com o resultado (agendado/publicado/erro) e, quando disponíveis, as métricas reais.

## Próximos passos possíveis (não implementados ainda)

- Rotina diária agendada (trigger) que gera os rascunhos automaticamente de manhã e aguarda aprovação no chat.
- Modo de publicação automática (sem aprovação, exceto para categorias marcadas como obrigatórias) — só depois de validado o modo aprovação durante algum tempo.
