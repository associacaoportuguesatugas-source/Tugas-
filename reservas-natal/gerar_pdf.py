"""Gera o PDF da lista de reservas da Festa de Natal a partir de reservas.csv."""
import csv
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

AQUI = Path(__file__).parent
VERMELHO = colors.HexColor("#B3202A")
VERDE = colors.HexColor("#1E5B3A")
LARANJA = colors.HexColor("#C77700")
VERDE_CLARO = colors.HexColor("#1FA34A")
LINHAS_EM_BRANCO = 2
NUMEROS = ["adultos", "criancas", "pessoas", "leitao", "bacalhau", "frango"]

with open(AQUI / "reservas.csv", encoding="utf-8") as f:
    linhas = [{k: (v or "").strip() for k, v in r.items()} for r in csv.DictReader(f, delimiter=";")]
reservas = [r for r in linhas if r["confirmado"] == "sim"]
pendentes = [r for r in linhas if r["confirmado"] != "sim"]


def soma(lista, campo):
    return sum(int(r[campo]) for r in lista if r[campo])


def celula(valor, sufixo):
    # O "?" só faz sentido em valores que existem e não são zero
    return valor + sufixo if valor not in ("", "0") else valor


def encomenda_definida(r):
    # Fica definida quando os pratos escolhidos cobrem todas as pessoas da reserva
    pratos = sum(int(r[c]) for c in ("leitao", "bacalhau", "frango") if r[c])
    return pratos > 0 and pratos == int(r["pessoas"])


def criar_tabela(lista, cor, cor_linhas, sufixo="", em_branco=0):
    dados = [["Nr.", "Name", "Erwachsene", "Kinder", "Total", "Leitão", "Bacalhau", "Frango", "Menü"]]
    dados += [[str(i), r["nome"] + sufixo] + [celula(r[c], sufixo) for c in NUMEROS]
              + ["*" if encomenda_definida(r) else ""]
              for i, r in enumerate(lista, 1)]
    dados += [[str(len(lista) + i)] + [""] * 8 for i in range(1, em_branco + 1)]
    # Os totais dos pratos só aparecem quando já há escolhas registadas
    dados.append(["", "TOTAL"] + [celula(str(soma(lista, c)), sufixo)
                                  if c in ("adultos", "criancas", "pessoas") or any(r[c] for r in lista) else ""
                                  for c in NUMEROS]
                 + [str(sum(encomenda_definida(r) for r in lista)) + "/" + str(len(lista))])
    tabela = Table(dados, colWidths=[9 * mm, 39 * mm, 21 * mm, 15 * mm, 15 * mm, 17 * mm, 19 * mm, 17 * mm, 13 * mm],
                   rowHeights=7 * mm, repeatRows=1)
    tabela.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), cor),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, cor_linhas]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#999999")),
        ("LINEBEFORE", (5, 0), (5, -1), 1.5, cor),
        ("BACKGROUND", (0, -1), (-1, -1), cor if sufixo else VERMELHO),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.white),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ALIGN", (1, -1), (1, -1), "RIGHT"),
        ("LINEBEFORE", (8, 0), (8, -1), 1.5, cor),
        ("FONTNAME", (8, 1), (8, -2), "Helvetica-Bold"),
        ("FONTSIZE", (8, 1), (8, -2), 18),
        ("TEXTCOLOR", (8, 1), (8, -2), VERDE_CLARO),
        ("VALIGN", (8, 1), (8, -2), "MIDDLE"),
        ("TOPPADDING", (8, 1), (8, -2), 7),
    ]))
    return tabela


total = soma(reservas, "pessoas")
titulo = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=22, textColor=VERMELHO, alignment=1, leading=26)
sub = ParagraphStyle("s", fontName="Helvetica", fontSize=12, textColor=VERDE, alignment=1, leading=16)
legenda = ParagraphStyle("l", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#555555"), alignment=1, leading=12)
secao = ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=14, textColor=LARANJA, leading=18)

doc = SimpleDocTemplate(str(AQUI / "Reservierungen_Weihnachtsfeier.pdf"), pagesize=A4,
                        topMargin=12 * mm, bottomMargin=12 * mm,
                        title="Weihnachtsfeier – Reservierungen", author="Associação Portuguesa Tuga")
doc.build([
    Paragraph("Weihnachtsfeier – Reservierungen", titulo),
    Spacer(1, 4 * mm),
    Paragraph("Associação Portuguesa Tuga · Samstag, 5. Dezember 2026", sub),
    Spacer(1, 2 * mm),
    Paragraph(f"{len(reservas)} Reservierung{'en' if len(reservas) != 1 else ''} · {total} Person{'en' if total != 1 else ''} bestätigt · aktualisiert am {date.today():%d.%m.%Y}", sub),
    Spacer(1, 2 * mm),
    Paragraph("Menüwahl pro Person: <b>Leitão</b> = Spanferkel · <b>Bacalhau</b> = Stockfisch mit Maisbrotkruste (com broa)"
              " · <b>Frango</b> = Brathähnchen (assado)"
              " · <font color='#1FA34A'><b>*</b></font> = Menü vollständig bestellt", legenda),
    Spacer(1, 5 * mm),
    criar_tabela(reservas, VERDE, colors.HexColor("#F6EFE6"), em_branco=LINHAS_EM_BRANCO),
] + ([
    Spacer(1, 5 * mm),
    Paragraph("Noch nicht bestätigt (?)", secao),
    Spacer(1, 3 * mm),
    criar_tabela(pendentes, LARANJA, colors.HexColor("#FDF1DE"), sufixo=" ?"),
] if pendentes else []))
