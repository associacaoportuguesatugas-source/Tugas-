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
LINHAS_EM_BRANCO = 10

with open(AQUI / "reservas.csv", encoding="utf-8") as f:
    reservas = [(r["nome"].strip(), int(r["pessoas"])) for r in csv.DictReader(f, delimiter=";")]
total = sum(p for _, p in reservas)

titulo = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=22, textColor=VERMELHO, alignment=1, leading=26)
sub = ParagraphStyle("s", fontName="Helvetica", fontSize=12, textColor=VERDE, alignment=1, leading=16)

dados = [["Nº", "Nome da reserva", "Nº de pessoas"]]
dados += [[str(i), nome, str(p)] for i, (nome, p) in enumerate(reservas, 1)]
dados += [[str(len(reservas) + i), "", ""] for i in range(1, LINHAS_EM_BRANCO + 1)]
dados.append(["", "TOTAL", str(total)])

tabela = Table(dados, colWidths=[15 * mm, 115 * mm, 35 * mm], rowHeights=9 * mm, repeatRows=1)
tabela.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), VERDE),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 11),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ALIGN", (0, 0), (0, -1), "CENTER"),
    ("ALIGN", (2, 0), (2, -1), "CENTER"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#F6EFE6")]),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#999999")),
    ("BACKGROUND", (0, -1), (-1, -1), VERMELHO),
    ("TEXTCOLOR", (0, -1), (-1, -1), colors.white),
    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
    ("ALIGN", (1, -1), (1, -1), "RIGHT"),
]))

doc = SimpleDocTemplate(str(AQUI / "Reservas_Festa_de_Natal.pdf"), pagesize=A4,
                        topMargin=18 * mm, bottomMargin=18 * mm,
                        title="Reservas – Festa de Natal", author="Associação Portuguesa Tuga")
doc.build([
    Paragraph("Festa de Natal – Reservas", titulo),
    Spacer(1, 4 * mm),
    Paragraph("Associação Portuguesa Tuga · Sábado, 5 de Dezembro de 2026", sub),
    Spacer(1, 2 * mm),
    Paragraph(f"{len(reservas)} reserva{'s' if len(reservas) != 1 else ''} · {total} pessoa{'s' if total != 1 else ''} · atualizado a {date.today():%d/%m/%Y}", sub),
    Spacer(1, 8 * mm),
    tabela,
])
