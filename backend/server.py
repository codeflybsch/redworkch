from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os
import logging
import uuid
import smtplib
import ssl
import asyncio
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.utils import formataddr
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

from seed_data import DEFAULT_FAQS, DEFAULT_EMAIL_TEMPLATES, DEFAULT_PRODUCT_CATEGORIES, DEFAULT_PRODUCTS
from qr_invoice import build_invoice_pdf, build_offer_pdf, render_invoice_html, render_offer_html

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ----------------------------------------------------------------------------
# Setup
# ----------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

SECRET_KEY = os.environ.get("JWT_SECRET", "redwork-ch-super-secret-change-in-prod-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

ADMIN_USER = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASSWORD", "Blevh4np1@@")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/admin/login", auto_error=False)

app = FastAPI(title="redwork.ch API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


# ----------------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------------
def now_utc():
    return datetime.now(timezone.utc)


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ----- Quote (Angebot einholen Lead) -----
class QuoteIn(BaseModel):
    fullName: str
    email: EmailStr
    phone: Optional[str] = ""
    company: Optional[str] = ""
    serviceType: str
    projectDetails: str
    budget: str
    timeline: str
    contactMethod: str = "email"
    contactTime: str = "any"


class Quote(QuoteIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "new"
    createdAt: datetime = Field(default_factory=now_utc)


class QuoteUpdate(BaseModel):
    status: Optional[str] = None


# ----- Contact -----
class ContactIn(BaseModel):
    fullName: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: str
    message: str


class Contact(ContactIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "new"
    createdAt: datetime = Field(default_factory=now_utc)


class ContactReplyIn(BaseModel):
    subject: str
    message: str


class ContactReply(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contactId: str
    subject: str
    message: str
    sentBy: str = "admin"
    emailSent: bool = False
    emailError: Optional[str] = None
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Project -----
class ProjectIn(BaseModel):
    title: str
    category: str
    img: str
    description: Optional[str] = ""
    url: Optional[str] = ""
    order: int = 0


class Project(ProjectIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Blog -----
class BlogIn(BaseModel):
    title: str
    category: str
    img: str
    excerpt: Optional[str] = ""
    content: Optional[str] = ""
    date: str
    order: int = 0


class Blog(BlogIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Testimonial -----
class TestimonialIn(BaseModel):
    name: str
    company: Optional[str] = ""
    text: str
    rating: int = 5
    order: int = 0


class Testimonial(TestimonialIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Service -----
class ServiceIn(BaseModel):
    title: str
    desc: str
    icon: str = "Smartphone"
    side: str = "left"
    order: int = 0


class Service(ServiceIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Site Settings -----
class HeroSlide(BaseModel):
    highlight: str
    word: str


class StatItem(BaseModel):
    number: str
    suffix: str = ""
    label: str


class SiteSettings(BaseModel):
    heroSubtitle: str = (
        "Mit der <y>preisgekrönten</y> Webdesign- und Software-Agentur entdecken Sie\n"
        "die <y>Weltklasse-Standards</y> auf Ihrer Website!"
    )
    heroTagline: str = "Wir sind anders, seien Sie auch anders."
    heroSlides: List[HeroSlide] = [
        HeroSlide(highlight="Unternehmens", word="Webdesign"),
        HeroSlide(highlight="E-Commerce", word="Webdesign"),
        HeroSlide(highlight="Persönliches", word="Webdesign"),
        HeroSlide(highlight="Produkt", word="Webdesign"),
        HeroSlide(highlight="Reise", word="Webdesign"),
        HeroSlide(highlight="Stiftung", word="Webdesign"),
    ]
    badgeEnabled: bool = True
    badgeNumber: str = "12"
    badgeUnit: str = "MONATE"
    badgeText1: str = "kostenloser"
    badgeText2: str = "Support"
    badgeFooter1: str = "für unsere Kunden"
    badgeFooter2: str = "inklusive!"
    btnContactSmall: str = "Fragen Sie uns ?"
    btnContactLarge: str = "Schreiben Sie uns"
    btnQuoteSmall: str = "Haben Sie ein Projekt ?"
    btnQuoteLarge: str = "Angebot einholen"
    partners: List[str] = [
        "GOOGLE PARTNER", "BING ADS", "YANDEX PARTNER",
        "MICROSOFT GOLD PARTNER", "ADOBE SOLUTION PARTNER",
    ]
    ratingStars: str = "★★★★★"
    ratingText: str = "Sehen Sie sich unsere <b>168 Bewertungen</b> an !"
    stats: List[StatItem] = [
        StatItem(number="61.300.000", suffix="+", label="Geschriebene Codezeilen"),
        StatItem(number="415.000", suffix="+", label="Einzigartige Webseiten"),
        StatItem(number="860", suffix="+", label="Abgeschlossene Projekte"),
        StatItem(number="2.100", suffix="+", label="Zufriedene Kunden"),
    ]
    navItems: List[dict] = [
        {"label": "start", "href": "#top"},
        {"label": "leistungen", "href": "#leistungen"},
        {"label": "projekte", "href": "#projekte"},
        {"label": "blog", "href": "#blog"},
        {"label": "über uns", "href": "#ueber"},
        {"label": "FAQ", "href": "#faq"},
        {"label": "kontakt", "href": "#kontakt"},
    ]
    howWeWorkTitle: str = "Wie wir arbeiten"
    howWeWorkSubtitle: str = "Unser bewährter 6-Schritte-Prozess für Ihren Projekterfolg"
    workSteps: List[dict] = []
    featuresTitle: str = "Unsere Stärken"
    featuresSubtitle: str = "Was uns als Agentur einzigartig macht"
    features: List[dict] = []
    whyUsTitle: str = "Warum redwork.ch?"
    whyUsSubtitle: str = "12 starke Gründe, die uns zur richtigen Wahl machen"
    reasons: List[dict] = []
    servicesTitle: str = "Was wir tun ?"
    servicesSubtitle: str = "Unsere Leistungen im Überblick"
    projectsTitle: str = "Was wir gemacht haben?"
    projectsSubtitle: str = "Referenzprojekte"
    promoSectionLabel: str = "UNTERNEHMENSVORSTELLUNG"
    promoVideoUrl: str = ""
    promoVideoTitle: str = "Lernen Sie uns in 90 Sekunden kennen"
    promoVideoSubtitle: str = "Ein kurzer Einblick in unsere Arbeitsweise"
    # Contact section
    contactTitle: str = "Kontakt"
    contactSubtitle: str = "Lassen Sie uns sprechen"
    contactIntro: str = "Wir freuen uns auf Ihre Nachricht. Wählen Sie den Kanal, der Ihnen am liebsten ist – wir antworten innerhalb von 24 Stunden."
    contactPhone: str = "+41 44 000 00 00"
    contactPhoneHours: str = "Mo–Fr 8–18 Uhr"
    contactEmail: str = "info@redwork.ch"
    contactEmailNote: str = "Antwort innert 24 h"
    contactWhatsapp: str = "+41 79 000 00 00"
    contactAddress: str = "Bahnhofstrasse 1, 8001 Zürich"
    contactMapUrl: str = "https://www.openstreetmap.org/export/embed.html?bbox=8.5392%2C47.3705%2C8.5444%2C47.3735&layer=mapnik"
    # FAQ section
    faqTitle: str = "Häufig gestellte Fragen"
    faqSubtitle: str = "Antworten auf die häufigsten Fragen unserer Kundinnen und Kunden"
    # Footer
    footerAbout: str = "redwork.ch ist Ihre Schweizer Premium-Agentur für Webdesign, Software-Entwicklung, SEO und digitales Marketing."
    footerAddress: str = "Bahnhofstrasse 1, 8001 Zürich, Schweiz"
    footerPhone: str = "+41 44 000 00 00"
    footerEmail: str = "info@redwork.ch"
    footerLinks: List[str] = []
    footerCopyright: str = "© 2026 redwork.ch – Alle Rechte vorbehalten"
    footerSlogan: str = "12 Monate kostenloser Support für alle unsere Kunden inklusive!"
    footerSocial: dict = {"facebook": "", "instagram": "", "linkedin": "", "twitter": "", "youtube": ""}


# ----- FAQ -----
class FAQIn(BaseModel):
    category: str
    question: str
    answer: str
    order: int = 0
    published: bool = True


class FAQ(FAQIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Email Template -----
class EmailTemplateIn(BaseModel):
    name: str
    category: Optional[str] = "Allgemein"
    subject: str
    body: str
    order: int = 0


class EmailTemplate(EmailTemplateIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Company (multiple per invoice setting) -----
class CompanyIn(BaseModel):
    name: str
    street: str = ""
    zip: str = ""
    city: str = ""
    country: str = "CH"
    vat: str = ""
    email: str = ""
    phone: str = ""
    iban: str = ""
    logoBase64: Optional[str] = ""  # base64 PNG/JPEG
    invoicePrefix: str = "RW-"
    nextInvoiceNumber: int = 1
    nextOfferNumber: int = 1
    paymentTerms: str = "Zahlbar innert 30 Tagen via beigefügtem QR-Code."
    defaultVatRate: float = 8.1
    currency: str = "CHF"
    language: str = "de"
    isDefault: bool = False
    order: int = 0


class Company(CompanyIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Product Category & Product (catalogue) -----
class ProductCategoryIn(BaseModel):
    name: str
    description: Optional[str] = ""
    order: int = 0


class ProductCategory(ProductCategoryIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


class ProductIn(BaseModel):
    categoryId: Optional[str] = ""
    name: str
    description: Optional[str] = ""
    unitPrice: float = 0.0
    unit: Optional[str] = "Stk."
    vatRate: Optional[float] = None  # falls None: aus Firma
    sku: Optional[str] = ""
    order: int = 0


class Product(ProductIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Invoice / Offer -----
class InvoiceItem(BaseModel):
    description: str
    quantity: float = 1.0
    unitPrice: float = 0.0
    productId: Optional[str] = ""


class InvoiceIn(BaseModel):
    companyId: Optional[str] = ""  # which of our companies
    title: Optional[str] = ""
    intro: Optional[str] = ""
    notes: Optional[str] = ""
    clientName: str
    clientStreet: Optional[str] = ""
    clientZip: Optional[str] = ""
    clientCity: Optional[str] = ""
    clientCountry: Optional[str] = "CH"
    clientEmail: Optional[str] = ""
    issueDate: Optional[str] = ""
    dueDate: Optional[str] = ""
    items: List[InvoiceItem] = []
    vatRate: Optional[float] = None
    currency: Optional[str] = "CHF"
    reference: Optional[str] = ""
    status: str = "draft"  # draft | sent | paid | overdue
    type: str = "invoice"  # "invoice" | "offer"
    # Recurring
    recurring: bool = False
    recurringInterval: Optional[str] = "monthly"  # monthly | quarterly | yearly
    recurringNextDate: Optional[str] = ""
    recurringEndDate: Optional[str] = ""
    parentId: Optional[str] = ""  # set on auto-generated children


class Invoice(InvoiceIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: str = ""
    subtotal: float = 0.0
    vatAmount: float = 0.0
    total: float = 0.0
    sentAt: Optional[datetime] = None
    paidAt: Optional[datetime] = None
    # Public signing (offers)
    publicToken: str = Field(default_factory=lambda: uuid.uuid4().hex)
    signedAt: Optional[datetime] = None
    signedBy: Optional[str] = ""
    signatureData: Optional[str] = ""  # base64 PNG of drawn signature
    signedIp: Optional[str] = ""
    declinedAt: Optional[datetime] = None
    declineReason: Optional[str] = ""
    createdAt: datetime = Field(default_factory=now_utc)


class InvoiceSendIn(BaseModel):
    subject: Optional[str] = ""
    message: Optional[str] = ""
    toEmail: Optional[str] = ""


# ----- Invoice template (saved item lists) -----
class InvoiceTemplateIn(BaseModel):
    name: str
    description: Optional[str] = ""
    items: List[InvoiceItem] = []
    notes: Optional[str] = ""
    intro: Optional[str] = ""
    title: Optional[str] = ""
    order: int = 0


class InvoiceTemplate(InvoiceTemplateIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=now_utc)


# ----- Reorder payload -----
class ReorderIn(BaseModel):
    ids: List[str]


# ----------------------------------------------------------------------------
# Auth helpers
# ----------------------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def require_admin(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Nicht authentifiziert")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        if role != "admin" or username != ADMIN_USER:
            raise HTTPException(status_code=401, detail="Ungültiges Token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Ungültiges Token")
    return {"username": username}


def clean(d):
    if d and "_id" in d:
        d.pop("_id")
    return d


# ----------------------------------------------------------------------------
# Email helper
# ----------------------------------------------------------------------------
def _send_email_smtp(to_email: str, to_name: str, subject: str, body: str,
                     attachment: Optional[tuple] = None) -> tuple:
    """Send email via SMTP with optional PDF attachment.
    attachment = (filename:str, bytes:bytes) or None.
    Returns (success_bool, error_message_or_None).
    """
    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "").strip()
    smtp_from = os.environ.get("SMTP_FROM", "").strip() or smtp_user
    smtp_from_name = os.environ.get("SMTP_FROM_NAME", "redwork.ch").strip()
    smtp_port = int(os.environ.get("SMTP_PORT", "587") or "587")
    use_tls = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

    if not smtp_host or not smtp_from:
        return False, "SMTP not configured"

    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"] = formataddr((smtp_from_name, smtp_from))
    msg["To"] = formataddr((to_name, to_email))

    alt = MIMEMultipart("alternative")
    text_part = MIMEText(body, "plain", "utf-8")
    html_body = f"""<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
<div style="white-space:pre-wrap;font-size:15px;">{body.replace('<','&lt;').replace('>','&gt;')}</div>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
<p style="font-size:12px;color:#64748b;">Diese Nachricht wurde von {smtp_from_name} gesendet.</p>
</div></body></html>"""
    html_part = MIMEText(html_body, "html", "utf-8")
    alt.attach(text_part)
    alt.attach(html_part)
    msg.attach(alt)

    if attachment:
        fname, raw = attachment
        att = MIMEApplication(raw, _subtype="pdf")
        att.add_header("Content-Disposition", "attachment", filename=fname)
        msg.attach(att)

    try:
        if smtp_port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=20) as server:
                if smtp_user:
                    server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
                server.ehlo()
                if use_tls:
                    server.starttls(context=ssl.create_default_context())
                    server.ehlo()
                if smtp_user:
                    server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, [to_email], msg.as_string())
        return True, None
    except Exception as e:
        logger.exception("SMTP send failed")
        return False, str(e)


# ----------------------------------------------------------------------------
# Routes : Auth
# ----------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "redwork.ch API läuft"}


@api_router.post("/admin/login", response_model=TokenOut)
async def admin_login(payload: LoginIn):
    if payload.username != ADMIN_USER or payload.password != ADMIN_PASS:
        raise HTTPException(status_code=401, detail="Benutzername oder Passwort ungültig")
    token = create_access_token({"sub": ADMIN_USER, "role": "admin"})
    return TokenOut(access_token=token, user={"username": ADMIN_USER, "role": "admin"})


@api_router.get("/admin/me")
async def admin_me(user=Depends(require_admin)):
    return user


# ----------------------------------------------------------------------------
# Routes : Quote (Lead)
# ----------------------------------------------------------------------------
@api_router.post("/quotes", response_model=Quote)
async def create_quote(payload: QuoteIn):
    q = Quote(**payload.dict())
    await db.quotes.insert_one(q.dict())
    return q


@api_router.get("/admin/quotes", response_model=List[Quote])
async def list_quotes(user=Depends(require_admin)):
    items = await db.quotes.find().sort("createdAt", -1).to_list(1000)
    return [Quote(**clean(i)) for i in items]


@api_router.patch("/admin/quotes/{quote_id}")
async def update_quote(quote_id: str, payload: QuoteUpdate, user=Depends(require_admin)):
    update = {k: v for k, v in payload.dict().items() if v is not None}
    res = await db.quotes.update_one({"id": quote_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Anfrage nicht gefunden")
    return {"ok": True}


@api_router.delete("/admin/quotes/{quote_id}")
async def delete_quote(quote_id: str, user=Depends(require_admin)):
    await db.quotes.delete_one({"id": quote_id})
    return {"ok": True}


# ----------------------------------------------------------------------------
# Routes : Contact
# ----------------------------------------------------------------------------
@api_router.post("/contacts", response_model=Contact)
async def create_contact(payload: ContactIn):
    c = Contact(**payload.dict())
    await db.contacts.insert_one(c.dict())
    # Forward to admin inbox (info@redwork.ch via SMTP)
    admin_inbox = os.environ.get("ADMIN_NOTIFY_EMAIL", "").strip() or os.environ.get("SMTP_FROM", "").strip()
    if admin_inbox:
        body = (
            f"Neue Kontakt-Nachricht von {c.fullName} <{c.email}>\n"
            f"Telefon: {c.phone or '—'}\n"
            f"Betreff: {c.subject}\n\n"
            f"{c.message}\n\n"
            f"---\nDirekt im Admin-Panel beantworten."
        )
        await asyncio.to_thread(
            _send_email_smtp, admin_inbox, "redwork.ch Admin",
            f"📩 Neue Nachricht: {c.subject}", body,
        )
    return c


@api_router.get("/admin/contacts", response_model=List[Contact])
async def list_contacts(user=Depends(require_admin)):
    items = await db.contacts.find().sort("createdAt", -1).to_list(1000)
    return [Contact(**clean(i)) for i in items]


@api_router.patch("/admin/contacts/{cid}")
async def update_contact(cid: str, payload: QuoteUpdate, user=Depends(require_admin)):
    update = {k: v for k, v in payload.dict().items() if v is not None}
    await db.contacts.update_one({"id": cid}, {"$set": update})
    return {"ok": True}


@api_router.delete("/admin/contacts/{cid}")
async def delete_contact(cid: str, user=Depends(require_admin)):
    await db.contacts.delete_one({"id": cid})
    await db.contact_replies.delete_many({"contactId": cid})
    return {"ok": True}


@api_router.get("/admin/contacts/{cid}/replies", response_model=List[ContactReply])
async def list_contact_replies(cid: str, user=Depends(require_admin)):
    contact = await db.contacts.find_one({"id": cid})
    if not contact:
        raise HTTPException(404, "Nachricht nicht gefunden")
    items = await db.contact_replies.find({"contactId": cid}).sort("createdAt", 1).to_list(1000)
    return [ContactReply(**clean(i)) for i in items]


@api_router.post("/admin/contacts/{cid}/reply", response_model=ContactReply)
async def reply_to_contact(cid: str, payload: ContactReplyIn, user=Depends(require_admin)):
    contact = await db.contacts.find_one({"id": cid})
    if not contact:
        raise HTTPException(404, "Nachricht nicht gefunden")
    if not payload.message.strip() or not payload.subject.strip():
        raise HTTPException(400, "Betreff und Nachricht dürfen nicht leer sein")

    sent, err = await asyncio.to_thread(
        _send_email_smtp,
        contact["email"], contact.get("fullName", ""),
        payload.subject, payload.message,
    )

    reply = ContactReply(
        contactId=cid, subject=payload.subject, message=payload.message,
        sentBy=user.get("username", "admin"), emailSent=sent,
        emailError=err if not sent else None,
    )
    await db.contact_replies.insert_one(reply.dict())
    new_status = "done" if sent else "in_progress"
    await db.contacts.update_one({"id": cid}, {"$set": {"status": new_status}})
    return reply


@api_router.delete("/admin/contacts/{cid}/replies/{rid}")
async def delete_contact_reply(cid: str, rid: str, user=Depends(require_admin)):
    await db.contact_replies.delete_one({"id": rid, "contactId": cid})
    return {"ok": True}


@api_router.get("/admin/email-config")
async def email_config(user=Depends(require_admin)):
    host = os.environ.get("SMTP_HOST", "").strip()
    sender = (os.environ.get("SMTP_FROM", "") or os.environ.get("SMTP_USER", "")).strip()
    return {"configured": bool(host and sender), "from": sender if sender else None}


# ----------------------------------------------------------------------------
# Generic CRUD factory
# ----------------------------------------------------------------------------
def make_crud(collection_name: str, ModelIn, Model, prefix: str, public: bool = True):
    if public:
        @api_router.get(f"/{prefix}", response_model=List[Model])
        async def list_items_public():
            items = await db[collection_name].find().sort("order", 1).to_list(1000)
            return [Model(**clean(i)) for i in items]

    @api_router.get(f"/admin/{prefix}", response_model=List[Model])
    async def list_items_admin(user=Depends(require_admin)):
        items = await db[collection_name].find().sort("order", 1).to_list(2000)
        return [Model(**clean(i)) for i in items]

    @api_router.post(f"/admin/{prefix}", response_model=Model)
    async def create_item(payload: ModelIn, user=Depends(require_admin)):
        item = Model(**payload.dict())
        await db[collection_name].insert_one(item.dict())
        return item

    @api_router.put(f"/admin/{prefix}/{{item_id}}", response_model=Model)
    async def update_item(item_id: str, payload: ModelIn, user=Depends(require_admin)):
        existing = await db[collection_name].find_one({"id": item_id})
        if not existing:
            raise HTTPException(404, "Nicht gefunden")
        merged = {**clean(existing), **payload.dict(), "id": item_id}
        await db[collection_name].update_one({"id": item_id}, {"$set": payload.dict()})
        return Model(**merged)

    @api_router.delete(f"/admin/{prefix}/{{item_id}}")
    async def delete_item(item_id: str, user=Depends(require_admin)):
        await db[collection_name].delete_one({"id": item_id})
        return {"ok": True}


make_crud("projects", ProjectIn, Project, "projects")
make_crud("blogs", BlogIn, Blog, "blogs")
make_crud("testimonials", TestimonialIn, Testimonial, "testimonials")
make_crud("services", ServiceIn, Service, "services")
make_crud("companies", CompanyIn, Company, "companies", public=False)
make_crud("product_categories", ProductCategoryIn, ProductCategory, "product-categories", public=False)
make_crud("products", ProductIn, Product, "products", public=False)
make_crud("invoice_templates", InvoiceTemplateIn, InvoiceTemplate, "invoice-templates", public=False)


@api_router.get("/products", response_model=List[Product])
async def list_products_public():
    items = await db.products.find().sort("order", 1).to_list(2000)
    return [Product(**clean(i)) for i in items]


@api_router.get("/product-categories", response_model=List[ProductCategory])
async def list_product_categories_public():
    items = await db.product_categories.find().sort("order", 1).to_list(2000)
    return [ProductCategory(**clean(i)) for i in items]


# ----------------------------------------------------------------------------
# Generic reorder endpoint (drag & drop ordering)
# ----------------------------------------------------------------------------
_REORDER_COLLECTIONS = {
    "projects", "blogs", "testimonials", "services", "faqs",
    "products", "product-categories", "invoice-templates", "email-templates",
    "companies",
}
_COL_MAP = {
    "product-categories": "product_categories",
    "invoice-templates": "invoice_templates",
    "email-templates": "email_templates",
}


@api_router.post("/admin/{collection}/reorder")
async def reorder_items(collection: str, payload: ReorderIn, user=Depends(require_admin)):
    if collection not in _REORDER_COLLECTIONS:
        raise HTTPException(404, "Sortierung für diese Kollektion nicht erlaubt")
    db_col = _COL_MAP.get(collection, collection)
    for idx, item_id in enumerate(payload.ids):
        await db[db_col].update_one({"id": item_id}, {"$set": {"order": idx}})
    return {"ok": True, "count": len(payload.ids)}


# ----------------------------------------------------------------------------
# Routes : Site Settings
# ----------------------------------------------------------------------------
SETTINGS_KEY = "main"


async def _get_settings() -> dict:
    doc = await db.site_settings.find_one({"key": SETTINGS_KEY})
    if not doc:
        defaults = SiteSettings().dict()
        defaults["key"] = SETTINGS_KEY
        await db.site_settings.insert_one(defaults)
        return defaults
    return clean(doc)


@api_router.get("/site-settings", response_model=SiteSettings)
async def get_site_settings():
    doc = await _get_settings()
    doc.pop("key", None)
    # Pydantic ignores unknown extras; fields missing from older docs fall back to defaults
    return SiteSettings(**{k: v for k, v in doc.items() if k in SiteSettings.__fields__})


@api_router.put("/admin/site-settings", response_model=SiteSettings)
async def update_site_settings(payload: SiteSettings, user=Depends(require_admin)):
    data = payload.dict()
    await db.site_settings.update_one({"key": SETTINGS_KEY}, {"$set": data}, upsert=True)
    return payload


# ----------------------------------------------------------------------------
# Routes : FAQ
# ----------------------------------------------------------------------------
@api_router.get("/faqs", response_model=List[FAQ])
async def list_faqs_public():
    items = await db.faqs.find({"published": True}).sort([("category", 1), ("order", 1)]).to_list(2000)
    return [FAQ(**clean(i)) for i in items]


@api_router.get("/faqs/categories")
async def list_faq_categories():
    cats = await db.faqs.distinct("category", {"published": True})
    return sorted(cats)


@api_router.get("/admin/faqs", response_model=List[FAQ])
async def list_faqs_admin(user=Depends(require_admin)):
    items = await db.faqs.find().sort([("category", 1), ("order", 1)]).to_list(5000)
    return [FAQ(**clean(i)) for i in items]


@api_router.post("/admin/faqs", response_model=FAQ)
async def create_faq(payload: FAQIn, user=Depends(require_admin)):
    obj = FAQ(**payload.dict())
    await db.faqs.insert_one(obj.dict())
    return obj


@api_router.put("/admin/faqs/{fid}", response_model=FAQ)
async def update_faq(fid: str, payload: FAQIn, user=Depends(require_admin)):
    existing = await db.faqs.find_one({"id": fid})
    if not existing:
        raise HTTPException(404, "FAQ nicht gefunden")
    merged = {**clean(existing), **payload.dict(), "id": fid}
    await db.faqs.update_one({"id": fid}, {"$set": payload.dict()})
    return FAQ(**merged)


@api_router.delete("/admin/faqs/{fid}")
async def delete_faq(fid: str, user=Depends(require_admin)):
    await db.faqs.delete_one({"id": fid})
    return {"ok": True}


# ----------------------------------------------------------------------------
# Routes : Email reply templates
# ----------------------------------------------------------------------------
@api_router.get("/admin/email-templates", response_model=List[EmailTemplate])
async def list_email_templates(user=Depends(require_admin)):
    items = await db.email_templates.find().sort([("category", 1), ("order", 1), ("name", 1)]).to_list(500)
    return [EmailTemplate(**clean(i)) for i in items]


@api_router.post("/admin/email-templates", response_model=EmailTemplate)
async def create_email_template(payload: EmailTemplateIn, user=Depends(require_admin)):
    obj = EmailTemplate(**payload.dict())
    await db.email_templates.insert_one(obj.dict())
    return obj


@api_router.put("/admin/email-templates/{tid}", response_model=EmailTemplate)
async def update_email_template(tid: str, payload: EmailTemplateIn, user=Depends(require_admin)):
    existing = await db.email_templates.find_one({"id": tid})
    if not existing:
        raise HTTPException(404, "Vorlage nicht gefunden")
    merged = {**clean(existing), **payload.dict(), "id": tid}
    await db.email_templates.update_one({"id": tid}, {"$set": payload.dict()})
    return EmailTemplate(**merged)


@api_router.delete("/admin/email-templates/{tid}")
async def delete_email_template(tid: str, user=Depends(require_admin)):
    await db.email_templates.delete_one({"id": tid})
    return {"ok": True}


# ----------------------------------------------------------------------------
# Routes : Companies (default helper)
# ----------------------------------------------------------------------------
async def _get_default_company() -> Optional[dict]:
    doc = await db.companies.find_one({"isDefault": True})
    if not doc:
        doc = await db.companies.find_one({})
    return clean(doc) if doc else None


@api_router.post("/admin/companies/{cid}/set-default")
async def set_default_company(cid: str, user=Depends(require_admin)):
    if not await db.companies.find_one({"id": cid}):
        raise HTTPException(404, "Firma nicht gefunden")
    await db.companies.update_many({}, {"$set": {"isDefault": False}})
    await db.companies.update_one({"id": cid}, {"$set": {"isDefault": True}})
    return {"ok": True}


# ----------------------------------------------------------------------------
# Routes : Invoices & Offers
# ----------------------------------------------------------------------------
def _calc_totals(items: List[InvoiceItem], vat_rate: float):
    subtotal = sum(float(i.quantity) * float(i.unitPrice) for i in items)
    vat_amount = subtotal * (vat_rate / 100.0)
    total = subtotal + vat_amount
    return round(subtotal, 2), round(vat_amount, 2), round(total, 2)


async def _next_number(company: dict, doc_type: str) -> str:
    prefix = company.get("invoicePrefix") or "RW-"
    field = "nextOfferNumber" if doc_type == "offer" else "nextInvoiceNumber"
    next_n = int(company.get(field) or 1)
    code = "ANG" if doc_type == "offer" else "RG"
    number = f"{prefix}{code}-{datetime.utcnow().year}-{next_n:05d}"
    await db.companies.update_one({"id": company["id"]}, {"$set": {field: next_n + 1}})
    return number


async def _resolve_company(company_id: Optional[str]) -> dict:
    if company_id:
        doc = await db.companies.find_one({"id": company_id})
        if doc:
            return clean(doc)
    default = await _get_default_company()
    if not default:
        raise HTTPException(400, "Bitte zuerst eine Firma in den Einstellungen anlegen.")
    return default


def _filter(t: str):
    return {"type": t} if t == "offer" else {"$or": [{"type": "invoice"}, {"type": {"$exists": False}}]}


@api_router.get("/admin/invoices", response_model=List[Invoice])
async def list_invoices(user=Depends(require_admin)):
    items = await db.invoices.find(_filter("invoice")).sort("createdAt", -1).to_list(2000)
    return [Invoice(**clean(i)) for i in items]


@api_router.get("/admin/offers", response_model=List[Invoice])
async def list_offers(user=Depends(require_admin)):
    items = await db.invoices.find(_filter("offer")).sort("createdAt", -1).to_list(2000)
    return [Invoice(**clean(i)) for i in items]


@api_router.get("/admin/invoices/{iid}", response_model=Invoice)
async def get_invoice(iid: str, user=Depends(require_admin)):
    doc = await db.invoices.find_one({"id": iid})
    if not doc:
        raise HTTPException(404, "Dokument nicht gefunden")
    return Invoice(**clean(doc))


async def _create_doc(payload: InvoiceIn, doc_type: str) -> Invoice:
    company = await _resolve_company(payload.companyId)
    vat_rate = payload.vatRate if payload.vatRate is not None else float(company.get("defaultVatRate", 8.1))
    subtotal, vat_amount, total = _calc_totals(payload.items, vat_rate)
    data = payload.dict()
    data["companyId"] = company["id"]
    data["type"] = doc_type
    if data.get("currency") is None:
        data["currency"] = company.get("currency", "CHF")
    inv = Invoice(
        **data,
        number=await _next_number(company, doc_type),
        subtotal=subtotal, vatAmount=vat_amount, total=total,
    )
    if vat_rate is not None:
        inv.vatRate = vat_rate
    await db.invoices.insert_one(inv.dict())
    return inv


@api_router.post("/admin/invoices", response_model=Invoice)
async def create_invoice(payload: InvoiceIn, user=Depends(require_admin)):
    return await _create_doc(payload, "invoice")


@api_router.post("/admin/offers", response_model=Invoice)
async def create_offer(payload: InvoiceIn, user=Depends(require_admin)):
    return await _create_doc(payload, "offer")


async def _update_doc(iid: str, payload: InvoiceIn) -> Invoice:
    existing = await db.invoices.find_one({"id": iid})
    if not existing:
        raise HTTPException(404, "Dokument nicht gefunden")
    company = await _resolve_company(payload.companyId or existing.get("companyId"))
    vat_rate = payload.vatRate if payload.vatRate is not None else float(company.get("defaultVatRate", 8.1))
    subtotal, vat_amount, total = _calc_totals(payload.items, vat_rate)
    update = {
        **payload.dict(),
        "companyId": company["id"],
        "subtotal": subtotal, "vatAmount": vat_amount, "total": total, "vatRate": vat_rate,
    }
    # don't override type via update
    update["type"] = existing.get("type", "invoice")
    await db.invoices.update_one({"id": iid}, {"$set": update})
    merged = {**clean(existing), **update, "id": iid}
    return Invoice(**merged)


@api_router.put("/admin/invoices/{iid}", response_model=Invoice)
async def update_invoice(iid: str, payload: InvoiceIn, user=Depends(require_admin)):
    return await _update_doc(iid, payload)


@api_router.put("/admin/offers/{iid}", response_model=Invoice)
async def update_offer(iid: str, payload: InvoiceIn, user=Depends(require_admin)):
    return await _update_doc(iid, payload)


@api_router.delete("/admin/invoices/{iid}")
async def delete_invoice(iid: str, user=Depends(require_admin)):
    await db.invoices.delete_one({"id": iid})
    return {"ok": True}


@api_router.delete("/admin/offers/{iid}")
async def delete_offer(iid: str, user=Depends(require_admin)):
    await db.invoices.delete_one({"id": iid})
    return {"ok": True}


def _legacy_settings_compat(company: dict) -> dict:
    """Map company doc to old settings dict expected by qr_invoice."""
    return {
        "companyName": company.get("name", ""),
        "companyStreet": company.get("street", ""),
        "companyZip": company.get("zip", ""),
        "companyCity": company.get("city", ""),
        "companyCountry": company.get("country", "CH"),
        "companyVat": company.get("vat", ""),
        "companyEmail": company.get("email", ""),
        "companyPhone": company.get("phone", ""),
        "iban": company.get("iban", ""),
        "language": company.get("language", "de"),
        "paymentTerms": company.get("paymentTerms", ""),
        "logoBase64": company.get("logoBase64", ""),
    }


def _validate_for_pdf(doc: dict, settings: dict, doc_type: str):
    if doc_type == "invoice" and (not settings.get("iban") or not settings.get("companyName")):
        raise HTTPException(400, "Bitte zuerst Firma vollständig anlegen (Name & IBAN).")
    if doc_type == "offer" and not settings.get("companyName"):
        raise HTTPException(400, "Bitte zuerst Firma anlegen (mindestens Name).")
    if not doc.get("clientName"):
        raise HTTPException(400, "Kundenname fehlt.")
    if not doc.get("items"):
        raise HTTPException(400, "Keine Positionen vorhanden.")


@api_router.get("/admin/invoices/{iid}/pdf")
async def invoice_pdf(iid: str, user=Depends(require_admin)):
    doc = await db.invoices.find_one({"id": iid})
    if not doc:
        raise HTTPException(404, "Dokument nicht gefunden")
    company = await _resolve_company(doc.get("companyId"))
    settings = _legacy_settings_compat(company)
    doc_type = doc.get("type", "invoice")
    _validate_for_pdf(doc, settings, doc_type)
    try:
        if doc_type == "offer":
            pdf_bytes = await asyncio.to_thread(build_offer_pdf, clean(doc), settings)
        else:
            pdf_bytes = await asyncio.to_thread(build_invoice_pdf, clean(doc), settings)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("PDF generation failed")
        raise HTTPException(500, f"PDF konnte nicht erstellt werden: {e}")
    label = "Offerte" if doc_type == "offer" else "Rechnung"
    filename = f"{label}-{doc.get('number', iid)}.pdf"
    return Response(
        content=pdf_bytes, media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@api_router.get("/admin/offers/{iid}/pdf")
async def offer_pdf(iid: str, user=Depends(require_admin)):
    return await invoice_pdf(iid, user)


@api_router.get("/admin/invoices/{iid}/preview", response_class=Response)
async def invoice_preview(iid: str, user=Depends(require_admin)):
    doc = await db.invoices.find_one({"id": iid})
    if not doc:
        raise HTTPException(404, "Dokument nicht gefunden")
    company = await _resolve_company(doc.get("companyId"))
    settings = _legacy_settings_compat(company)
    doc_type = doc.get("type", "invoice")
    if doc_type == "offer":
        html = render_offer_html(clean(doc), settings)
    else:
        html = render_invoice_html(clean(doc), settings)
    return Response(content=html, media_type="text/html; charset=utf-8")


@api_router.get("/admin/offers/{iid}/preview", response_class=Response)
async def offer_preview(iid: str, user=Depends(require_admin)):
    return await invoice_preview(iid, user)


async def _send_doc(iid: str, payload: InvoiceSendIn, doc_type_label: str) -> dict:
    doc = await db.invoices.find_one({"id": iid})
    if not doc:
        raise HTTPException(404, "Dokument nicht gefunden")
    company = await _resolve_company(doc.get("companyId"))
    settings = _legacy_settings_compat(company)
    actual_type = doc.get("type", "invoice")
    _validate_for_pdf(doc, settings, actual_type)

    to_email = (payload.toEmail or doc.get("clientEmail") or "").strip()
    if not to_email:
        raise HTTPException(400, "Keine Empfänger-E-Mail vorhanden.")

    label = "Offerte" if actual_type == "offer" else "Rechnung"
    default_subject = f"{label} {doc.get('number', '')} – {company.get('name', '')}"
    default_body = (
        f"Sehr geehrte Damen und Herren,\n\n"
        f"anbei erhalten Sie unsere {label} Nr. {doc.get('number', '')}.\n"
        + ("Wir freuen uns auf Ihre Rückmeldung.\n\n" if actual_type == "offer"
           else "Wir bedanken uns im Voraus für die Zahlung gemäss beigefügter QR-Rechnung.\n\n")
        + f"Freundliche Grüsse\n{company.get('name','')}"
    )
    subject = payload.subject or default_subject
    body = payload.message or default_body

    try:
        if actual_type == "offer":
            pdf_bytes = await asyncio.to_thread(build_offer_pdf, clean(doc), settings)
        else:
            pdf_bytes = await asyncio.to_thread(build_invoice_pdf, clean(doc), settings)
    except Exception as e:
        logger.exception("PDF generation failed during send")
        raise HTTPException(500, f"PDF konnte nicht erstellt werden: {e}")

    filename = f"{label}-{doc.get('number', iid)}.pdf"
    sent, err = await asyncio.to_thread(
        _send_email_smtp, to_email, doc.get("clientName", ""),
        subject, body, (filename, pdf_bytes),
    )
    if not sent:
        return {"ok": False, "error": err}

    upd = {"status": "sent", "sentAt": now_utc()}
    await db.invoices.update_one({"id": iid}, {"$set": upd})
    return {"ok": True, "to": to_email}


@api_router.post("/admin/invoices/{iid}/send")
async def send_invoice(iid: str, payload: InvoiceSendIn, user=Depends(require_admin)):
    return await _send_doc(iid, payload, "invoice")


@api_router.post("/admin/offers/{iid}/send")
async def send_offer(iid: str, payload: InvoiceSendIn, user=Depends(require_admin)):
    return await _send_doc(iid, payload, "offer")


@api_router.post("/admin/invoices/{iid}/mark-paid")
async def mark_paid(iid: str, user=Depends(require_admin)):
    await db.invoices.update_one({"id": iid}, {"$set": {"status": "paid", "paidAt": now_utc()}})
    return {"ok": True}


class StatusIn(BaseModel):
    status: str


@api_router.patch("/admin/invoices/{iid}/status")
async def set_doc_status(iid: str, payload: StatusIn, user=Depends(require_admin)):
    allowed = {"draft", "sent", "paid", "overdue", "accepted", "declined"}
    if payload.status not in allowed:
        raise HTTPException(400, f"Status nicht erlaubt: {payload.status}")
    if not await db.invoices.find_one({"id": iid}):
        raise HTTPException(404, "Dokument nicht gefunden")
    update = {"status": payload.status}
    if payload.status == "paid":
        update["paidAt"] = now_utc()
    await db.invoices.update_one({"id": iid}, {"$set": update})
    return {"ok": True}


# ----------------------------------------------------------------------------
# Public offer signing flow
# ----------------------------------------------------------------------------
class OfferAcceptIn(BaseModel):
    signedBy: str
    signatureData: str = ""


class OfferDeclineIn(BaseModel):
    declineReason: Optional[str] = ""


def _public_offer_dto(doc: dict, company: dict) -> dict:
    return {
        "number": doc.get("number"),
        "title": doc.get("title", ""),
        "intro": doc.get("intro", ""),
        "notes": doc.get("notes", ""),
        "issueDate": doc.get("issueDate", ""),
        "currency": doc.get("currency", "CHF"),
        "items": doc.get("items", []),
        "subtotal": doc.get("subtotal", 0),
        "vatRate": doc.get("vatRate", 0),
        "vatAmount": doc.get("vatAmount", 0),
        "total": doc.get("total", 0),
        "status": doc.get("status", "sent"),
        "signedAt": doc.get("signedAt"),
        "signedBy": doc.get("signedBy"),
        "declinedAt": doc.get("declinedAt"),
        "clientName": doc.get("clientName"),
        "clientStreet": doc.get("clientStreet", ""),
        "clientZip": doc.get("clientZip", ""),
        "clientCity": doc.get("clientCity", ""),
        "company": {
            "name": company.get("name", ""),
            "street": company.get("street", ""),
            "zip": company.get("zip", ""),
            "city": company.get("city", ""),
            "email": company.get("email", ""),
            "phone": company.get("phone", ""),
            "logoBase64": company.get("logoBase64", ""),
        },
    }


@api_router.get("/offers/public/{token}")
async def get_public_offer(token: str):
    doc = await db.invoices.find_one({"publicToken": token, "type": "offer"})
    if not doc:
        raise HTTPException(404, "Offerte nicht gefunden oder Link ungültig")
    company = await _resolve_company(doc.get("companyId"))
    return _public_offer_dto(clean(doc), company)


@api_router.post("/offers/public/{token}/accept")
async def accept_public_offer(token: str, payload: OfferAcceptIn):
    doc = await db.invoices.find_one({"publicToken": token, "type": "offer"})
    if not doc:
        raise HTTPException(404, "Offerte nicht gefunden")
    if doc.get("status") in ("accepted", "declined"):
        raise HTTPException(400, "Diese Offerte wurde bereits beantwortet.")
    if not payload.signedBy.strip():
        raise HTTPException(400, "Bitte Namen für Signatur angeben.")
    update = {
        "status": "accepted",
        "signedAt": now_utc(),
        "signedBy": payload.signedBy.strip(),
        "signatureData": (payload.signatureData or "")[:200000],
    }
    await db.invoices.update_one({"id": doc["id"]}, {"$set": update})
    admin_inbox = os.environ.get("ADMIN_NOTIFY_EMAIL", "").strip() or os.environ.get("SMTP_FROM", "").strip()
    if admin_inbox:
        body = (
            f"Offerte {doc.get('number')} wurde von {payload.signedBy} angenommen.\n\n"
            f"Kunde: {doc.get('clientName')} ({doc.get('clientEmail') or '—'})\n"
            f"Total: {doc.get('currency','CHF')} {doc.get('total')}\n\n"
            f"Sie können die Offerte nun in eine Rechnung umwandeln."
        )
        await asyncio.to_thread(
            _send_email_smtp, admin_inbox, "redwork.ch Admin",
            f"✅ Offerte {doc.get('number')} angenommen", body,
        )
    return {"ok": True, "status": "accepted"}


@api_router.post("/offers/public/{token}/decline")
async def decline_public_offer(token: str, payload: OfferDeclineIn):
    doc = await db.invoices.find_one({"publicToken": token, "type": "offer"})
    if not doc:
        raise HTTPException(404, "Offerte nicht gefunden")
    if doc.get("status") in ("accepted", "declined"):
        raise HTTPException(400, "Diese Offerte wurde bereits beantwortet.")
    await db.invoices.update_one({"id": doc["id"]}, {"$set": {
        "status": "declined", "declinedAt": now_utc(),
        "declineReason": (payload.declineReason or "")[:500],
    }})
    admin_inbox = os.environ.get("ADMIN_NOTIFY_EMAIL", "").strip() or os.environ.get("SMTP_FROM", "").strip()
    if admin_inbox:
        await asyncio.to_thread(
            _send_email_smtp, admin_inbox, "redwork.ch Admin",
            f"❌ Offerte {doc.get('number')} abgelehnt",
            f"Kunde: {doc.get('clientName')}\nGrund: {payload.declineReason or '—'}",
        )
    return {"ok": True, "status": "declined"}


# ----------------------------------------------------------------------------
# Public single Project & Blog endpoints (for detail pages)
# ----------------------------------------------------------------------------
@api_router.get("/projects/{pid}", response_model=Project)
async def get_project_public(pid: str):
    doc = await db.projects.find_one({"id": pid})
    if not doc:
        raise HTTPException(404, "Projekt nicht gefunden")
    return Project(**clean(doc))


@api_router.get("/blogs/{bid}", response_model=Blog)
async def get_blog_public(bid: str):
    doc = await db.blogs.find_one({"id": bid})
    if not doc:
        raise HTTPException(404, "Beitrag nicht gefunden")
    return Blog(**clean(doc))



# ----------------------------------------------------------------------------
# Duplicate (invoice or offer) – copies items + customer, new draft
# ----------------------------------------------------------------------------
@api_router.post("/admin/invoices/{iid}/duplicate", response_model=Invoice)
async def duplicate_doc(iid: str, user=Depends(require_admin)):
    doc = await db.invoices.find_one({"id": iid})
    if not doc:
        raise HTTPException(404, "Dokument nicht gefunden")
    company = await _resolve_company(doc.get("companyId"))
    new_type = doc.get("type", "invoice")
    cleaned = clean(doc).copy()
    for key in ("id", "createdAt", "number", "sentAt", "paidAt", "status",
                "recurringNextDate", "parentId"):
        cleaned.pop(key, None)
    cleaned["status"] = "draft"
    cleaned["recurring"] = False
    items = [InvoiceItem(**it) for it in cleaned.get("items", [])]
    inv = Invoice(
        **{k: v for k, v in cleaned.items() if k != "items"},
        items=items,
        number=await _next_number(company, new_type),
    )
    await db.invoices.insert_one(inv.dict())
    return inv


# ----------------------------------------------------------------------------
# Convert offer -> invoice
# ----------------------------------------------------------------------------
@api_router.post("/admin/offers/{iid}/convert-to-invoice", response_model=Invoice)
async def offer_to_invoice(iid: str, user=Depends(require_admin)):
    doc = await db.invoices.find_one({"id": iid, "type": "offer"})
    if not doc:
        raise HTTPException(404, "Offerte nicht gefunden")
    company = await _resolve_company(doc.get("companyId"))
    cleaned = clean(doc).copy()
    for key in ("id", "createdAt", "number", "sentAt", "paidAt"):
        cleaned.pop(key, None)
    cleaned["type"] = "invoice"
    cleaned["status"] = "draft"
    cleaned["parentId"] = iid
    items = [InvoiceItem(**it) for it in cleaned.get("items", [])]
    inv = Invoice(
        **{k: v for k, v in cleaned.items() if k != "items"},
        items=items,
        number=await _next_number(company, "invoice"),
    )
    await db.invoices.insert_one(inv.dict())
    return inv


# ----------------------------------------------------------------------------
# Run recurring invoices – generates new invoice if recurringNextDate has passed
# ----------------------------------------------------------------------------
def _add_interval(date_str: str, interval: str) -> str:
    try:
        d = datetime.strptime(date_str[:10], "%Y-%m-%d")
    except Exception:
        d = datetime.utcnow()
    if interval == "yearly":
        d = d.replace(year=d.year + 1)
    elif interval == "quarterly":
        m = d.month + 3
        y = d.year + (m - 1) // 12
        d = d.replace(year=y, month=((m - 1) % 12) + 1)
    else:  # monthly
        m = d.month + 1
        y = d.year + (m - 1) // 12
        d = d.replace(year=y, month=((m - 1) % 12) + 1)
    return d.strftime("%Y-%m-%d")


@api_router.post("/admin/invoices/run-recurring")
async def run_recurring(user=Depends(require_admin)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    parents = await db.invoices.find({
        "recurring": True,
        "type": "invoice",
        "$or": [
            {"recurringNextDate": {"$lte": today}},
            {"recurringNextDate": {"$exists": False}},
            {"recurringNextDate": ""},
        ],
    }).to_list(500)

    created = []
    for parent in parents:
        end_date = parent.get("recurringEndDate") or ""
        if end_date and end_date <= today:
            continue
        company = await _resolve_company(parent.get("companyId"))
        cleaned = clean(parent).copy()
        for key in ("id", "createdAt", "number", "sentAt", "paidAt"):
            cleaned.pop(key, None)
        cleaned["status"] = "draft"
        cleaned["recurring"] = False  # the child is a one-off
        cleaned["parentId"] = parent["id"]
        cleaned["issueDate"] = today
        items = [InvoiceItem(**it) for it in cleaned.get("items", [])]
        new_inv = Invoice(
            **{k: v for k, v in cleaned.items() if k != "items"},
            items=items,
            number=await _next_number(company, "invoice"),
        )
        await db.invoices.insert_one(new_inv.dict())
        created.append(new_inv.number)

        # advance parent next date
        interval = parent.get("recurringInterval") or "monthly"
        next_date = _add_interval(parent.get("recurringNextDate") or today, interval)
        await db.invoices.update_one({"id": parent["id"]}, {"$set": {"recurringNextDate": next_date}})

    return {"ok": True, "created": created, "count": len(created)}


# ----------------------------------------------------------------------------
# Stats
# ----------------------------------------------------------------------------
@api_router.get("/admin/stats")
async def admin_stats(user=Depends(require_admin)):
    return {
        "quotes": await db.quotes.count_documents({}),
        "newQuotes": await db.quotes.count_documents({"status": "new"}),
        "contacts": await db.contacts.count_documents({}),
        "newContacts": await db.contacts.count_documents({"status": "new"}),
        "projects": await db.projects.count_documents({}),
        "blogs": await db.blogs.count_documents({}),
        "testimonials": await db.testimonials.count_documents({}),
        "services": await db.services.count_documents({}),
        "invoices": await db.invoices.count_documents(_filter("invoice")),
        "offers": await db.invoices.count_documents(_filter("offer")),
        "faqs": await db.faqs.count_documents({}),
        "products": await db.products.count_documents({}),
        "companies": await db.companies.count_documents({}),
        "invoiceTemplates": await db.invoice_templates.count_documents({}),
        "recurringInvoices": await db.invoices.count_documents({"recurring": True, "type": "invoice"}),
    }


# ----------------------------------------------------------------------------
# Seed default content
# ----------------------------------------------------------------------------
DEFAULT_PROJECTS = [
    {"title": "Alpenblick Boutique", "category": "E-Commerce", "img": "https://images.unsplash.com/photo-1707836885254-79b6e3d7b18d?w=800&q=80", "description": "Online-Shop für Schweizer Premium-Mode", "order": 1},
    {"title": "Schweizer Beratung GmbH", "category": "Unternehmenswebsite", "img": "https://images.unsplash.com/photo-1637502875124-eb4a9843a2fa?w=800&q=80", "description": "Kompletter Webauftritt mit CMS", "order": 2},
    {"title": "Klima-Service Zürich", "category": "Service-Plattform", "img": "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?w=800&q=80", "description": "Buchungssystem und Termine", "order": 3},
    {"title": "Berner Architektur", "category": "Portfolio", "img": "https://images.pexels.com/photos/18105/pexels-photo.jpg?w=800&q=80", "description": "Modernes Architektur-Portfolio", "order": 4},
    {"title": "Genfer Tour Operator", "category": "Reise-Plattform", "img": "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?w=800&q=80", "description": "Reisebuchungs-Plattform", "order": 5},
    {"title": "Basel Akademie", "category": "Bildungsplattform", "img": "https://images.pexels.com/photos/8968807/pexels-photo-8968807.jpeg?w=800&q=80", "description": "Online-Lernplattform", "order": 6},
]

DEFAULT_BLOGS = [
    {"title": "Was ist Webdesign und warum ist es wichtig?", "category": "Webdesign", "img": "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80", "excerpt": "Erfahren Sie, warum gutes Webdesign der Schlüssel zum Online-Erfolg ist.", "date": "15. März 2026", "order": 1},
    {"title": "Die besten Webdesign-Trends für 2026", "category": "Webdesign", "img": "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80", "excerpt": "Die wichtigsten Designtrends, die Sie kennen sollten.", "date": "10. März 2026", "order": 2},
    {"title": "SEO-Strategien für nachhaltigen Erfolg", "category": "SEO", "img": "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&q=80", "excerpt": "Effektive SEO-Methoden für Ihre Website.", "date": "01. März 2026", "order": 4},
    {"title": "React vs. Next.js – Welches ist besser?", "category": "Softwareentwicklung", "img": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80", "excerpt": "Ein detaillierter Vergleich beider Frameworks.", "date": "25. Februar 2026", "order": 5},
]

DEFAULT_TESTIMONIALS = [
    {"name": "Hans Müller", "company": "Müller GmbH, Zürich", "text": "redwork.ch ist hervorragend in der Erstellung professioneller Webseiten. Sie bringen Branding und Webentwicklung perfekt zusammen.", "order": 1, "rating": 5},
    {"name": "Klaus Schmidt", "company": "Schmidt & Partner, Bern", "text": "Sehr aufmerksam, modern, technisch versiert. Unsere Besucher lieben die neue Website.", "order": 2, "rating": 5},
    {"name": "Maria Weber", "company": "Weber Solutions, Basel", "text": "redwork.ch hat Webdesign UND Marketing auf höchstem Niveau geliefert.", "order": 3, "rating": 5},
    {"name": "Anna Becker", "company": "Becker Industries, Genf", "text": "Ich war sehr zufrieden, ich empfehle es jedem.", "order": 4, "rating": 5},
    {"name": "Michael Wagner", "company": "Wagner AG, Luzern", "text": "Innovative und schnelle Lösungen, vollständig professioneller Service.", "order": 5, "rating": 5},
    {"name": "Sabine Fischer", "company": "Fischer Media, Lausanne", "text": "Vielen Dank für all Ihre Dienste. Eine sehr empfehlenswerte Agentur.", "order": 6, "rating": 5},
]

DEFAULT_SERVICES = [
    {"title": "Webdesign", "desc": "Modern, funktional, mobiltauglich, originell, benutzerfreundlich, ökonomisch, innovativ und konversionsorientierte Webdesign-Projekte.", "icon": "Smartphone", "side": "left", "order": 1},
    {"title": "Softwareentwicklung", "desc": "PHP, MySQL, Node.js, MongoDB, .NET – die Programmiersprache Ihrer Wahl.", "icon": "Code", "side": "right", "order": 2},
    {"title": "SEO-Optimierung", "desc": "Während der Projektphase berücksichtigen wir grundlegende und moderne SEO-Regeln.", "icon": "Search", "side": "left", "order": 3},
    {"title": "Werbemanagement", "desc": "Google Ads, Facebook, Instagram – Optimierungs- und Verwaltungsmanagement Ihrer Werbung.", "icon": "Megaphone", "side": "right", "order": 4},
    {"title": "Logo & Corporate Identity", "desc": "Professionelle, kreative und einprägsame Corporate Identity, Logos, Embleme.", "icon": "Award", "side": "left", "order": 5},
    {"title": "Web-Beratung", "desc": "Wir bieten professionelle Lösungen für Ihre IT-Bedürfnisse.", "icon": "MessageSquare", "side": "right", "order": 6},
]

DEFAULT_COMPANIES = [
    {
        "name": "redwork.ch", "street": "Bahnhofstrasse 1", "zip": "8001", "city": "Zürich",
        "country": "CH", "vat": "CHE-123.456.789 MWST", "email": "info@redwork.ch", "phone": "+41 44 000 00 00",
        "iban": "CH4431999123000889012", "currency": "CHF", "defaultVatRate": 8.1, "language": "de",
        "isDefault": True, "invoicePrefix": "RW-", "order": 0,
        "paymentTerms": "Zahlbar innert 30 Tagen via beigefügtem QR-Code.",
    },
]


@app.on_event("startup")
async def seed_default_content():
    seeders = [
        ("projects", DEFAULT_PROJECTS, Project),
        ("blogs", DEFAULT_BLOGS, Blog),
        ("testimonials", DEFAULT_TESTIMONIALS, Testimonial),
        ("services", DEFAULT_SERVICES, Service),
        ("faqs", DEFAULT_FAQS, FAQ),
        ("email_templates", DEFAULT_EMAIL_TEMPLATES, EmailTemplate),
        ("companies", DEFAULT_COMPANIES, Company),
        ("product_categories", DEFAULT_PRODUCT_CATEGORIES, ProductCategory),
        ("products", DEFAULT_PRODUCTS, Product),
    ]
    for col, defaults, Model in seeders:
        count = await db[col].count_documents({})
        if count == 0 and defaults:
            for d in defaults:
                obj = Model(**d)
                await db[col].insert_one(obj.dict())
            logger.info(f"Seeded {len(defaults)} entries to {col}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ----------------------------------------------------------------------------
# App configuration
# ----------------------------------------------------------------------------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
