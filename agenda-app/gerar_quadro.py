# -*- coding: utf-8 -*-
"""Gera a pagina de acompanhamento (so leitura) a partir das entradas da agenda."""
import json, datetime, html, sys

# Quadro publico: sem as notas internas (nomes, precos, detalhes de fornecedores).
SEM_NOTAS = True

HOJE = datetime.date(2026, 9, 7)
WINZERFEST = datetime.date(2026, 10, 2)

MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
MESES_L = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto",
           "setembro","outubro","novembro","dezembro"]
DIAS = ["segunda","terça","quarta","quinta","sexta","sábado","domingo"]
DIAS_C = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"]
TIPOS = {"reuniao":"Reunião","tarefa":"Tarefa","evento":"Evento","lembrete":"Lembrete"}

entradas = json.load(open("entradas.json", encoding="utf-8"))
for e in entradas:
    e["_d"] = datetime.date(*map(int, e["data"].split("-")))
entradas.sort(key=lambda e: (e["_d"], e.get("hora") or "99:99", e["titulo"]))

def esc(s): return html.escape(s or "")
def curto(d): return "%s %d %s" % (DIAS_C[d.weekday()], d.day, MESES[d.month-1])
def longo(d): return "%s, %d de %s de %d" % (DIAS[d.weekday()], d.day, MESES_L[d.month-1], d.year)

fim_semana = HOJE + datetime.timedelta(days=6)
semana   = [e for e in entradas if HOJE <= e["_d"] <= fim_semana]
depois   = [e for e in entradas if e["_d"] > fim_semana]
passadas = [e for e in entradas if e["_d"] < HOJE]

def cartao(e):
    hora = esc(e.get("hora")) or "—"
    linhas = []
    if e.get("local"): linhas.append(esc(e["local"]))
    meta = '<div class="local">%s</div>' % " · ".join(linhas) if linhas else ""
    notas = "" if SEM_NOTAS else ('<p class="notas">%s</p>' % esc(e.get("notas")) if e.get("notas") else "")
    feito = " feito" if e.get("feito") else ""
    return ('<article class="item%s">'
            '<span class="hora mono">%s</span>'
            '<div><span class="tag t-%s">%s</span>'
            '<h3>%s</h3>%s%s</div>'
            '</article>') % (feito, hora, e["tipo"], TIPOS.get(e["tipo"], e["tipo"]),
                             esc(e["titulo"]), meta, notas)

def por_dia(lista):
    out, atual = [], None
    for e in lista:
        if e["_d"] != atual:
            if atual is not None: out.append("</div></section>")
            atual = e["_d"]
            marca = ' <span class="hoje">hoje</span>' if atual == HOJE else ""
            out.append('<section class="dia"><div class="dia-h"><span class="mono">%s</span>%s</div><div class="itens">'
                       % (curto(atual), marca))
        out.append(cartao(e))
    if atual is not None: out.append("</div></section>")
    return "\n".join(out) or '<p class="vazio">Nada marcado.</p>'

faltam = (WINZERFEST - HOJE).days

doc = """<title>Quadro da Direção Tuga</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
:root{
  --paper:#eceae4; --surface:#fbfaf7; --surface-2:#f3f1eb;
  --ink:#16151a; --ink-2:#585460; --ink-3:#8a8590;
  --line:#dbd7cf; --line-2:#c6c1b6;
  --gold:#9c6d1f; --gold-soft:#f1e4c7;
  --green:#2b6349; --green-soft:#d9e9df;
  --red:#a2372e; --red-soft:#f5dcd8;
  --slate:#4a5560; --slate-soft:#e0e4e8;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#0b0b0c; --surface:#151417; --surface-2:#1c1a1f;
    --ink:#f2ede3; --ink-2:#a7a29a; --ink-3:#7a756f;
    --line:#272328; --line-2:#39343b;
    --gold:#f2c96a; --gold-soft:#3a2e14;
    --green:#7cc9a1; --green-soft:#16301f;
    --red:#e4796d; --red-soft:#3a1c19;
    --slate:#9fb0bf; --slate-soft:#222a31;
  }
}
:root[data-theme="dark"]{
  --paper:#0b0b0c; --surface:#151417; --surface-2:#1c1a1f;
  --ink:#f2ede3; --ink-2:#a7a29a; --ink-3:#7a756f;
  --line:#272328; --line-2:#39343b;
  --gold:#f2c96a; --gold-soft:#3a2e14;
  --green:#7cc9a1; --green-soft:#16301f;
  --red:#e4796d; --red-soft:#3a1c19;
  --slate:#9fb0bf; --slate-soft:#222a31;
}
*{ box-sizing:border-box; }
body{ background:var(--paper); color:var(--ink); font-family:'Work Sans',Helvetica,Arial,sans-serif;
      font-size:15.5px; line-height:1.55; -webkit-font-smoothing:antialiased; }
h1,h2,h3{ margin:0; font-family:'Fraunces',Georgia,serif; font-weight:700; letter-spacing:-.01em; text-wrap:balance; }
.mono{ font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; }
.wrap{ max-width:760px; margin:0 auto; padding:0 20px 72px; }

header.top{ border-bottom:1px solid var(--line); background:var(--surface); }
.top-in{ max-width:760px; margin:0 auto; padding:26px 20px 22px; }
.eyebrow{ font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-3); }
.top h1{ font-size:30px; margin:6px 0 4px; }
.top .upd{ font-size:12.5px; color:var(--ink-2); }

.countdown{
  display:flex; align-items:baseline; gap:14px; flex-wrap:wrap;
  margin:24px 0 30px; padding:16px 20px; border-radius:10px;
  background:var(--gold-soft); border:1px solid var(--line);
}
.countdown .n{ font-family:'IBM Plex Mono',monospace; font-size:30px; font-weight:600; color:var(--gold); line-height:1; }
.countdown .t{ font-size:14px; color:var(--ink-2); }
.countdown strong{ color:var(--ink); font-weight:600; }

h2.sec{ font-size:19px; margin:38px 0 4px; }
.sec-sub{ font-size:13px; color:var(--ink-3); margin:0 0 16px; }

.dia{ margin-top:22px; }
.dia-h{ display:flex; align-items:center; gap:10px; padding-bottom:8px; border-bottom:1px solid var(--line-2); }
.dia-h .mono{ font-size:12.5px; letter-spacing:.1em; color:var(--ink-2); }
.hoje{ font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; font-weight:600;
       color:var(--gold); border:1px solid var(--gold); border-radius:4px; padding:1.5px 7px; }
.itens{ display:flex; flex-direction:column; }
.item{ display:grid; grid-template-columns:58px 1fr; gap:14px; padding:14px 2px; border-bottom:1px solid var(--line); }
.item:last-child{ border-bottom:0; }
.item.feito{ opacity:.5; }
.item.feito h3{ text-decoration:line-through; }
.hora{ font-size:13px; color:var(--ink); padding-top:3px; }
.item h3{ font-family:'Work Sans',sans-serif; font-size:16px; font-weight:600; margin:5px 0 0; letter-spacing:-.005em; }
.tag{ display:inline-block; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; font-weight:600; padding:2.5px 8px; border-radius:4px; }
.t-reuniao{ background:var(--gold-soft); color:var(--gold); }
.t-tarefa{ background:var(--green-soft); color:var(--green); }
.t-evento{ background:var(--red-soft); color:var(--red); }
.t-lembrete{ background:var(--slate-soft); color:var(--slate); }
.local{ font-size:13px; color:var(--ink-2); margin-top:2px; }
.notas{ font-size:13.5px; color:var(--ink-2); margin:6px 0 0; max-width:62ch; }
.vazio{ color:var(--ink-3); }

footer.pe{ margin-top:44px; padding-top:18px; border-top:1px solid var(--line); font-size:12.5px; color:var(--ink-3); }
@media (max-width:520px){
  .item{ grid-template-columns:48px 1fr; gap:10px; }
  .top h1{ font-size:25px; }
}
@media print{
  body{ background:#fff; color:#000; } .countdown{ background:#f4f4f4; }
}
</style>

<header class="top">
  <div class="top-in">
    <div class="eyebrow">Associação Portuguesa Tuga</div>
    <h1>Quadro da Direção</h1>
    <div class="upd">Atualizado em __UPD__ · página só de leitura</div>
  </div>
</header>

<div class="wrap">
  <div class="countdown">
    <span class="n mono" id="faltam">__FALTAM__</span>
    <span class="t">dias para a <strong>Winzerfest</strong> — 2 a 4 de outubro, Döttingen</span>
  </div>

  <h2 class="sec">Esta semana</h2>
  <p class="sec-sub">De __DE__ a __ATE__</p>
  __SEMANA__

  <h2 class="sec">A seguir</h2>
  <p class="sec-sub">Eventos e preparativos com data marcada</p>
  __DEPOIS__

  <footer class="pe">
    Resumo da agenda interna da direção, atualizado manualmente. Só mostra o que está marcado —
    os detalhes de cada ponto ficam na agenda interna. Para acrescentar ou alterar alguma coisa,
    fala com quem trata da agenda.
  </footer>
</div>

<script>
(function(){
  var alvo = new Date(2026, 9, 2);
  var hoje = new Date(); hoje.setHours(0,0,0,0);
  var d = Math.round((alvo - hoje) / 86400000);
  var el = document.getElementById("faltam");
  if (el && d >= 0) el.textContent = d;
})();
</script>
"""

doc = (doc.replace("__UPD__", longo(HOJE))
          .replace("__FALTAM__", str(faltam))
          .replace("__DE__", curto(HOJE).lower())
          .replace("__ATE__", curto(fim_semana).lower())
          .replace("__SEMANA__", por_dia(semana))
          .replace("__DEPOIS__", por_dia(depois)))

open("quadro.html", "w", encoding="utf-8").write(doc)
print("quadro.html:", len(doc), "bytes ·", len(semana), "esta semana ·", len(depois), "a seguir ·", len(passadas), "passadas")
