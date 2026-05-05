"""Swiss QR-Bill invoice & offer PDF generator + HTML preview."""
from __future__ import annotations

import io
import base64
import html as html_lib
from datetime import datetime
from decimal import Decimal

from qrbill import QRBill
from stdnum.ch import esr
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    Paragraph, Table, TableStyle, SimpleDocTemplate, Spacer, Image,
)
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.utils import ImageReader
from svglib.svglib import svg2rlg


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _fmt_money(value, currency: str = "CHF") -> str:
    d = Decimal(str(value or 0)).quantize(Decimal("0.01"))
    s = f"{d:,.2f}".replace(",", "'")
    return f"{currency} {s}"


def _fmt_date(d) -> str:
    if isinstance(d, datetime):
        return d.strftime("%d.%m.%Y")
    if isinstance(d, str) and d:
        try:
            return datetime.fromisoformat(d.replace("Z", "+00:00")).strftime("%d.%m.%Y")
        except Exception:
            try:
                return datetime.strptime(d[:10], "%Y-%m-%d").strftime("%d.%m.%Y")
            except Exception:
                return d
    return ""


def _is_qr_iban(iban: str) -> bool:
    s = (iban or "").replace(" ", "")
    if len(s) < 9 or s[:2].upper() != "CH":
        return False
    inst = s[4:9]
    return inst.isdigit() and 30000 <= int(inst) <= 31999


def _make_qr_reference(seed: str) -> str:
    digits = "".join(ch for ch in (seed or "") if ch.isdigit())
    if not digits:
        digits = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    digits = digits.rjust(26, "0")[-26:]
    if int(digits) == 0:
        digits = digits[:-1] + "1"
    return digits + esr.calc_check_digit(digits)


def _decode_logo(logo_b64: str):
    if not logo_b64:
        return None
    try:
        data = logo_b64.split(",")[-1]  # strip data: prefix if present
        raw = base64.b64decode(data)
        return ImageReader(io.BytesIO(raw))
    except Exception:
        return None


# ---------------------------------------------------------------------------
# QR-bill drawing
# ---------------------------------------------------------------------------
def _qrbill_drawing(invoice: dict, settings: dict):
    creditor = {
        "name": settings["companyName"],
        "line1": settings.get("companyStreet") or "-",
        "line2": f"{settings.get('companyZip','')} {settings.get('companyCity','')}".strip() or "-",
        "country": settings.get("companyCountry", "CH"),
    }
    debtor = None
    if invoice.get("clientName"):
        debtor = {
            "name": invoice["clientName"],
            "line1": invoice.get("clientStreet") or "",
            "line2": f"{invoice.get('clientZip','')} {invoice.get('clientCity','')}".strip(),
            "country": invoice.get("clientCountry", "CH"),
        }
        if not debtor["line1"] or not debtor["line2"]:
            debtor = None

    iban = (settings.get("iban") or "").replace(" ", "")
    reference = invoice.get("reference") or ""
    if _is_qr_iban(iban):
        if not reference or not reference.replace(" ", "").isdigit() or len(reference.replace(" ", "")) != 27:
            reference = _make_qr_reference(invoice.get("number", "") or invoice.get("id", ""))

    bill = QRBill(
        account=iban,
        creditor=creditor,
        amount=str(Decimal(str(invoice.get("total", 0))).quantize(Decimal("0.01"))),
        currency=invoice.get("currency", "CHF"),
        debtor=debtor,
        additional_information=(invoice.get("number") or "")[:140] or None,
        language=settings.get("language", "de") or "de",
        reference_number=reference or None,
    )
    svg_buf = io.StringIO()
    bill.as_svg(svg_buf)
    return svg2rlg(io.BytesIO(svg_buf.getvalue().encode("utf-8")))


# ---------------------------------------------------------------------------
# Shared layout for invoice + offer
# ---------------------------------------------------------------------------
def _build_doc(invoice: dict, settings: dict, *, doc_kind: str) -> bytes:
    """doc_kind: 'invoice' or 'offer'."""
    is_offer = doc_kind == "offer"
    buf = io.BytesIO()

    styles = getSampleStyleSheet()
    h_right = ParagraphStyle("h_right", parent=styles["Normal"], alignment=TA_RIGHT, fontSize=9, leading=12)
    h_small = ParagraphStyle("h_small", parent=styles["Normal"], fontSize=9, leading=12)
    h_title = ParagraphStyle("h_title", parent=styles["Normal"], fontSize=18, leading=22, spaceAfter=4, fontName="Helvetica-Bold")
    h_label = ParagraphStyle("h_label", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#64748b"), spaceAfter=2)

    # Reserve QR area only for invoices.
    bottom_reserve = (10.5 * cm + 0.5 * cm) if not is_offer else 2 * cm
    label_word = "Offerte" if is_offer else "Rechnung"

    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=bottom_reserve,
        title=f"{label_word} {invoice.get('number','')}",
        author=settings.get("companyName", "redwork.ch"),
    )
    story = []

    company_lines = [
        f"<b>{settings.get('companyName','')}</b>",
        settings.get("companyStreet", ""),
        f"{settings.get('companyZip','')} {settings.get('companyCity','')}".strip(),
    ]
    if settings.get("companyVat"):
        company_lines.append(f"MwSt-Nr: {settings['companyVat']}")
    if settings.get("companyEmail"):
        company_lines.append(settings["companyEmail"])
    if settings.get("companyPhone"):
        company_lines.append(settings["companyPhone"])

    meta = [
        f"<b>{label_word.upper()}</b>",
        f"Nr.: {invoice.get('number','-')}",
        f"Datum: {_fmt_date(invoice.get('issueDate') or datetime.utcnow())}",
    ]
    if not is_offer:
        meta.append(f"Fällig: {_fmt_date(invoice.get('dueDate'))}")
    if invoice.get("reference"):
        meta.append(f"Referenz: {invoice['reference']}")

    # Optional logo on the left
    logo = _decode_logo(settings.get("logoBase64"))
    left_cell = Paragraph("<br/>".join([l for l in company_lines if l]), h_small)
    if logo:
        try:
            iw, ih = logo.getSize()
            target_h = 1.5 * cm
            target_w = iw * (target_h / ih)
            img = Image(io.BytesIO(base64.b64decode(settings["logoBase64"].split(",")[-1])), width=target_w, height=target_h)
            left_cell = Table([[img], [Paragraph("<br/>".join([l for l in company_lines if l]), h_small)]], colWidths=[10 * cm])
            left_cell.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, 0), 6)]))
        except Exception:
            pass

    header = Table(
        [[left_cell, Paragraph("<br/>".join(meta), h_right)]],
        colWidths=[10 * cm, 7 * cm],
    )
    header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(header)
    story.append(Spacer(1, 0.6 * cm))

    bill_to_lines = [f"<b>{invoice.get('clientName','')}</b>"]
    if invoice.get("clientStreet"):
        bill_to_lines.append(invoice["clientStreet"])
    if invoice.get("clientZip") or invoice.get("clientCity"):
        bill_to_lines.append(f"{invoice.get('clientZip','')} {invoice.get('clientCity','')}".strip())
    story.append(Paragraph("Rechnung an:" if not is_offer else "Offerte an:", h_label))
    story.append(Paragraph("<br/>".join(bill_to_lines), h_small))
    story.append(Spacer(1, 0.6 * cm))

    if invoice.get("title"):
        story.append(Paragraph(f"<b>{invoice['title']}</b>", h_title))
    if invoice.get("intro"):
        story.append(Paragraph(invoice["intro"], h_small))
        story.append(Spacer(1, 0.3 * cm))

    currency = invoice.get("currency", "CHF") or "CHF"
    table_data = [["#", "Beschreibung", "Menge", "Einzelpreis", "Total"]]
    for i, it in enumerate(invoice.get("items", []), start=1):
        qty = Decimal(str(it.get("quantity", 1)))
        price = Decimal(str(it.get("unitPrice", 0)))
        line_total = (qty * price).quantize(Decimal("0.01"))
        table_data.append([
            str(i),
            Paragraph(it.get("description", ""), h_small),
            f"{qty.normalize()}",
            _fmt_money(price, currency),
            _fmt_money(line_total, currency),
        ])
    items_table = Table(table_data, colWidths=[0.8 * cm, 9 * cm, 2 * cm, 2.7 * cm, 2.7 * cm], repeatRows=1)
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.HexColor("#0f172a")),
        ("LINEBELOW", (0, 1), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 0.3 * cm))

    subtotal = Decimal(str(invoice.get("subtotal", 0))).quantize(Decimal("0.01"))
    vat_rate = Decimal(str(invoice.get("vatRate", 0)))
    vat_amount = Decimal(str(invoice.get("vatAmount", 0))).quantize(Decimal("0.01"))
    total = Decimal(str(invoice.get("total", 0))).quantize(Decimal("0.01"))

    totals_data = [
        ["Zwischensumme", _fmt_money(subtotal, currency)],
        [f"MwSt ({vat_rate}%)", _fmt_money(vat_amount, currency)],
        ["Total", _fmt_money(total, currency)],
    ]
    totals_table = Table(totals_data, colWidths=[5 * cm, 4 * cm], hAlign="RIGHT")
    totals_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("LINEABOVE", (0, 2), (-1, 2), 0.6, colors.HexColor("#0f172a")),
        ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#f1f5f9")),
        ("TOPPADDING", (0, 2), (-1, 2), 6),
        ("BOTTOMPADDING", (0, 2), (-1, 2), 6),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 0.5 * cm))

    if invoice.get("notes"):
        story.append(Paragraph("<b>Hinweise:</b>", h_label))
        story.append(Paragraph(invoice["notes"], h_small))
        story.append(Spacer(1, 0.3 * cm))

    if not is_offer:
        payment_terms = settings.get("paymentTerms") or "Zahlbar innert 30 Tagen via beigefügtem QR-Code."
        story.append(Paragraph(payment_terms, h_small))

    if is_offer:
        doc.build(story)
        return buf.getvalue()

    qrbill_drawing = _qrbill_drawing(invoice, settings)

    def _draw_qrbill(canv: canvas.Canvas, _doc):
        qrbill_drawing.drawOn(canv, 0, 0)

    doc.build(story, onFirstPage=_draw_qrbill, onLaterPages=_draw_qrbill)
    return buf.getvalue()


def build_invoice_pdf(invoice: dict, settings: dict) -> bytes:
    return _build_doc(invoice, settings, doc_kind="invoice")


def build_offer_pdf(offer: dict, settings: dict) -> bytes:
    return _build_doc(offer, settings, doc_kind="offer")


# ---------------------------------------------------------------------------
# HTML preview
# ---------------------------------------------------------------------------
def _html_escape(s) -> str:
    return html_lib.escape(str(s or ""))


def _render_html(invoice: dict, settings: dict, *, doc_kind: str) -> str:
    is_offer = doc_kind == "offer"
    label = "Offerte" if is_offer else "Rechnung"
    currency = invoice.get("currency", "CHF") or "CHF"

    rows_html = ""
    for i, it in enumerate(invoice.get("items", []), start=1):
        qty = Decimal(str(it.get("quantity", 1)))
        price = Decimal(str(it.get("unitPrice", 0)))
        line_total = (qty * price).quantize(Decimal("0.01"))
        rows_html += (
            f"<tr><td>{i}</td>"
            f"<td>{_html_escape(it.get('description',''))}</td>"
            f"<td class='r'>{qty.normalize()}</td>"
            f"<td class='r'>{_fmt_money(price, currency)}</td>"
            f"<td class='r'>{_fmt_money(line_total, currency)}</td></tr>"
        )

    logo_html = ""
    if settings.get("logoBase64"):
        src = settings["logoBase64"]
        if not src.startswith("data:"):
            src = f"data:image/png;base64,{src}"
        logo_html = f"<img src='{src}' alt='Logo' style='max-height:60px;margin-bottom:10px;'/>"

    company_html = (
        f"{logo_html}"
        f"<strong>{_html_escape(settings.get('companyName',''))}</strong><br/>"
        f"{_html_escape(settings.get('companyStreet',''))}<br/>"
        f"{_html_escape(settings.get('companyZip',''))} {_html_escape(settings.get('companyCity',''))}<br/>"
    )
    if settings.get("companyVat"):
        company_html += f"MwSt-Nr: {_html_escape(settings['companyVat'])}<br/>"
    if settings.get("companyEmail"):
        company_html += f"{_html_escape(settings['companyEmail'])}<br/>"

    payment_block = ""
    if not is_offer:
        payment_block = (
            f"<div class='payment'><strong>Zahlung:</strong><br/>"
            f"IBAN: {_html_escape(settings.get('iban',''))}<br/>"
            f"{_html_escape(settings.get('paymentTerms',''))}<br/>"
            f"<em>Im finalen PDF erscheint hier ein Schweizer QR-Einzahlungsschein.</em></div>"
        )

    return f"""<!doctype html><html lang="de"><head>
<meta charset="utf-8"/>
<title>{label} {_html_escape(invoice.get('number',''))}</title>
<style>
  *{{box-sizing:border-box}}
  body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;margin:0;padding:30px;background:#f1f5fb}}
  .sheet{{max-width:880px;margin:0 auto;background:white;padding:50px;border-radius:14px;box-shadow:0 12px 40px -12px rgba(0,0,0,0.12)}}
  h1{{font-size:24px;margin:0 0 4px;letter-spacing:1px}}
  .head{{display:flex;justify-content:space-between;gap:30px;margin-bottom:30px}}
  .meta{{text-align:right;font-size:13px;line-height:1.6}}
  .label{{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px}}
  table{{width:100%;border-collapse:collapse;margin-top:14px}}
  th{{background:#0f172a;color:#fff;padding:10px;text-align:left;font-size:12px}}
  td{{padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px;vertical-align:top}}
  td.r,th.r{{text-align:right}}
  .totals{{margin-top:20px;width:340px;margin-left:auto;font-size:13px}}
  .totals .row{{display:flex;justify-content:space-between;padding:6px 10px}}
  .totals .total{{background:#f1f5f9;font-weight:700;border-top:2px solid #0f172a}}
  .payment{{margin-top:30px;padding:18px;background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;font-size:13px}}
  .badge{{display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#E63946;color:white;text-transform:uppercase;letter-spacing:0.06em}}
  .small{{font-size:12px;color:#64748b}}
</style></head><body>
<div class="sheet">
  <div class="head">
    <div>{company_html}</div>
    <div class="meta">
      <span class="badge">{label}</span>
      <h1 style="margin-top:8px">Nr. {_html_escape(invoice.get('number','-'))}</h1>
      <div>Datum: {_fmt_date(invoice.get('issueDate') or datetime.utcnow())}</div>
      {f"<div>Fällig: {_fmt_date(invoice.get('dueDate'))}</div>" if not is_offer else ""}
      {f"<div>Referenz: {_html_escape(invoice.get('reference',''))}</div>" if invoice.get('reference') else ""}
    </div>
  </div>

  <div class="label">{label} an</div>
  <div style="font-size:14px;line-height:1.5">
    <strong>{_html_escape(invoice.get('clientName',''))}</strong><br/>
    {_html_escape(invoice.get('clientStreet',''))}<br/>
    {_html_escape(invoice.get('clientZip',''))} {_html_escape(invoice.get('clientCity',''))}
  </div>

  {f"<h2 style='margin-top:30px'>{_html_escape(invoice.get('title',''))}</h2>" if invoice.get('title') else ""}
  {f"<p>{_html_escape(invoice.get('intro',''))}</p>" if invoice.get('intro') else ""}

  <table>
    <thead><tr><th>#</th><th>Beschreibung</th><th class="r">Menge</th><th class="r">Einzelpreis</th><th class="r">Total</th></tr></thead>
    <tbody>{rows_html or '<tr><td colspan="5" style="text-align:center;padding:24px;color:#94a3b8">Keine Positionen erfasst</td></tr>'}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Zwischensumme</span><span>{_fmt_money(invoice.get('subtotal', 0), currency)}</span></div>
    <div class="row"><span>MwSt ({invoice.get('vatRate', 0)}%)</span><span>{_fmt_money(invoice.get('vatAmount', 0), currency)}</span></div>
    <div class="row total"><span>Total</span><span>{_fmt_money(invoice.get('total', 0), currency)}</span></div>
  </div>

  {f"<div class='small' style='margin-top:24px'><strong>Hinweise:</strong><br/>{_html_escape(invoice.get('notes',''))}</div>" if invoice.get('notes') else ""}
  {payment_block}
  <p class="small" style="margin-top:30px;text-align:center">{_html_escape(settings.get('companyName',''))} &bull; Vorschau – Druck via PDF-Export</p>
</div></body></html>"""


def render_invoice_html(invoice: dict, settings: dict) -> str:
    return _render_html(invoice, settings, doc_kind="invoice")


def render_offer_html(offer: dict, settings: dict) -> str:
    return _render_html(offer, settings, doc_kind="offer")
