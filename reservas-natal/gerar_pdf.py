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
LINHAS_EM_BRANCO = 2

with open(AQUI / "reservas.csv", encoding="utf-8") as f:
    linhas = list(csv.DictReader(f, delimiter=";"))
reservas = [(r["nome"].strip(), r["adultos"].strip(), r["criancas"].strip(), int(r["pessoas"]))
            for r in linhas if r["confirmado"].strip() == "sim"]
pendentes = [(r["nome"].strip(), r["adultos"].strip(), r["criancas"].strip(), int(r["pessoas"]))
             for r in linhas if r["confirmado"].strip() != "sim"]


def totais(lista):
    return (sum(int(r[1]) for r in lista if r[1]), sum(int(r[2]) for r in lista if r[2]), sum(r[3] for r in lista))


def criar_tabela(lista, cor, cor_linhas, sufixo="", em_branco=0):
    adultos, criancas, total = totais(lista)
    dados = [["Nr.", "Name", "Erwachsene", "Kinder", "Total"]]
    dados += [[str(i), nome + sufixo, a + sufixo if a else "", c, str(p) + sufixo]
              for i, (nome, a, c, p) in enumerate(lista, 1)]
    dados += [[str(len(lista) + i), "", "", "", ""] for i in range(1, em_branco + 1)]
    dados.append(["", "TOTAL", str(adultos) + sufixo, str(criancas), str(total) + sufixo])
    tabela = Table(dados, colWidths=[13 * mm, 87 * mm, 26 * mm, 20 * mm, 20 * mm], rowHeights=7.5 * mm, repeatRows=1)
    tabela.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), cor),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, cor_linhas]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#999999")),
        ("BACKGROUND", (0, -1), (-1, -1), cor if sufixo else VERMELHO),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.white),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ALIGN", (1, -1), (1, -1), "RIGHT"),
    ]))
    return tabela


total = totais(reservas)[2]
titulo = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=22, textColor=VERMELHO, alignment=1, leading=26)
sub = ParagraphStyle("s", fontName="Helvetica", fontSize=12, textColor=VERDE, alignment=1, leading=16)
secao = ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=14, textColor=LARANJA, leading=18)

doc = SimpleDocTemplate(str(AQUI / "Reservierungen_Weihnachtsfeier.pdf"), pagesize=A4,
                        topMargin=18 * mm, bottomMargin=18 * mm,
                        title="Weihnachtsfeier – Reservierungen", author="Associação Portuguesa Tuga")
doc.build([
    Paragraph("Weihnachtsfeier – Reservierungen", titulo),
    Spacer(1, 4 * mm),
    Paragraph("Associação Portuguesa Tuga · Samstag, 5. Dezember 2026", sub),
    Spacer(1, 2 * mm),
    Paragraph(f"{len(reservas)} Reservierung{'en' if len(reservas) != 1 else ''} · {total} Person{'en' if total != 1 else ''} bestätigt · aktualisiert am {date.today():%d.%m.%Y}", sub),
    Spacer(1, 8 * mm),
    criar_tabela(reservas, VERDE, colors.HexColor("#F6EFE6"), em_branco=LINHAS_EM_BRANCO),
] + ([
    Spacer(1, 7 * mm),
    Paragraph("Noch nicht bestätigt (?)", secao),
    Spacer(1, 3 * mm),
    criar_tabela(pendentes, LARANJA, colors.HexColor("#FDF1DE"), sufixo=" ?"),
] if pendentes else []))
