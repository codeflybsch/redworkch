"""Backend API tests for redwork.ch admin panel + CMS."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://debian-ubuntu-guide.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_USER = "admin"
ADMIN_PASS = "Blevh4np1@@"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=20)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- AUTH & STATS ----------
class TestAuthAndStats:
    def test_login_returns_token(self, token):
        assert isinstance(token, str) and len(token) > 20

    def test_login_invalid(self):
        r = requests.post(f"{API}/admin/login", json={"username": "admin", "password": "wrong"}, timeout=20)
        assert r.status_code in (400, 401, 403)

    def test_stats(self, auth):
        r = requests.get(f"{API}/admin/stats", headers=auth, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        # Required counters
        for key in ("invoices", "offers", "faqs", "products", "companies"):
            assert key in data, f"missing {key} in {data}"


# ---------- COMPANIES ----------
class TestCompanies:
    def test_list_default_company(self, auth):
        r = requests.get(f"{API}/admin/companies", headers=auth, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 1

    def test_create_update_delete(self, auth):
        payload = {"name": "TEST_Company", "address": "Teststr. 1", "city": "Zürich", "zip": "8000", "country": "CH",
                   "iban": "CH9300762011623852957", "email": "t@test.ch"}
        r = requests.post(f"{API}/admin/companies", json=payload, headers=auth, timeout=20)
        assert r.status_code in (200, 201), r.text
        cid = r.json()["id"]

        # Update
        r2 = requests.put(f"{API}/admin/companies/{cid}", json={**payload, "city": "Bern"}, headers=auth, timeout=20)
        assert r2.status_code == 200, r2.text
        assert r2.json()["city"] == "Bern"

        # set default
        r3 = requests.post(f"{API}/admin/companies/{cid}/set-default", headers=auth, timeout=20)
        assert r3.status_code == 200, r3.text

        # delete
        r4 = requests.delete(f"{API}/admin/companies/{cid}", headers=auth, timeout=20)
        assert r4.status_code in (200, 204)


# ---------- PRODUCTS & CATEGORIES ----------
class TestProducts:
    def test_list_categories_seeded(self, auth):
        r = requests.get(f"{API}/admin/product-categories", headers=auth, timeout=20)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list) and len(cats) >= 6

    def test_list_products_seeded(self, auth):
        r = requests.get(f"{API}/admin/products", headers=auth, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 15  # ~20 seeded

    def test_product_crud(self, auth):
        payload = {"name": "TEST_Product", "description": "desc", "unitPrice": 99.0, "vatRate": 8.1, "unit": "Stk."}
        r = requests.post(f"{API}/admin/products", json=payload, headers=auth, timeout=20)
        assert r.status_code in (200, 201), r.text
        pid = r.json()["id"]
        assert r.json()["name"] == "TEST_Product"
        # update
        r2 = requests.put(f"{API}/admin/products/{pid}", json={**payload, "unitPrice": 150.0}, headers=auth, timeout=20)
        assert r2.status_code == 200
        assert r2.json()["unitPrice"] == 150.0
        # delete
        r3 = requests.delete(f"{API}/admin/products/{pid}", headers=auth, timeout=20)
        assert r3.status_code in (200, 204)


# ---------- FAQs ----------
class TestFAQs:
    def test_public_faqs(self):
        r = requests.get(f"{API}/faqs", timeout=30)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        # ~987 expected
        assert len(items) >= 500, f"expected >=500 published FAQs, got {len(items)}"

    def test_admin_faqs(self, auth):
        r = requests.get(f"{API}/admin/faqs", headers=auth, timeout=30)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 500

    def test_faq_crud(self, auth):
        payload = {"question": "TEST_Q?", "answer": "TEST_A", "category": "Allgemein", "published": True}
        r = requests.post(f"{API}/admin/faqs", json=payload, headers=auth, timeout=20)
        assert r.status_code in (200, 201)
        fid = r.json()["id"]
        r2 = requests.put(f"{API}/admin/faqs/{fid}", json={**payload, "answer": "UPDATED"}, headers=auth, timeout=20)
        assert r2.status_code == 200
        assert r2.json()["answer"] == "UPDATED"
        r3 = requests.delete(f"{API}/admin/faqs/{fid}", headers=auth, timeout=20)
        assert r3.status_code in (200, 204)


# ---------- EMAIL TEMPLATES ----------
class TestEmailTemplates:
    def test_list(self, auth):
        r = requests.get(f"{API}/admin/email-templates", headers=auth, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 15  # ~20 seeded


# ---------- SITE SETTINGS ----------
class TestSiteSettings:
    def test_public_settings(self):
        r = requests.get(f"{API}/site-settings", timeout=20)
        assert r.status_code == 200
        data = r.json()
        # Look for new contact* and faqTitle fields
        keys = list(data.keys())
        has_contact = any(k.lower().startswith("contact") for k in keys)
        has_faq = any("faq" in k.lower() for k in keys)
        assert has_contact, f"no contact* fields in site-settings: {keys}"
        assert has_faq, f"no faqTitle field: {keys}"


# ---------- INVOICES ----------
@pytest.fixture(scope="class")
def invoice_id(auth):
    payload = {
        "clientName": "TEST_Client",
        "clientStreet": "Kundengasse 1",
        "clientZip": "8000",
        "clientCity": "Zürich",
        "clientCountry": "CH",
        "clientEmail": "client@test.ch",
        "items": [
            {"description": "TEST Service", "quantity": 2, "unitPrice": 100.0},
            {"description": "TEST Item", "quantity": 1, "unitPrice": 50.0},
        ],
        "vatRate": 8.1,
        "notes": "TEST notes",
    }
    r = requests.post(f"{API}/admin/invoices", json=payload, headers=auth, timeout=30)
    assert r.status_code in (200, 201), r.text
    inv = r.json()
    return inv


class TestInvoices:
    def test_create_invoice(self, invoice_id):
        inv = invoice_id
        assert "id" in inv
        # Number must follow RW-RG-2026-XXXXX
        num = inv.get("number") or inv.get("invoice_number") or ""
        assert "RW-RG-2026" in num or "RG-2026" in num, f"unexpected number {num}"
        # Totals computed
        subtotal = inv.get("subtotal")
        total = inv.get("total")
        vat = inv.get("vatAmount")
        assert subtotal and total, f"subtotal/total missing: {inv}"
        assert abs(float(subtotal) - 250.0) < 0.01
        assert float(total) > float(subtotal)  # VAT added
        assert vat is not None

    def test_get_invoice(self, invoice_id, auth):
        iid = invoice_id["id"]
        r = requests.get(f"{API}/admin/invoices/{iid}", headers=auth, timeout=20)
        assert r.status_code == 200

    def test_update_invoice_recalculates(self, invoice_id, auth):
        iid = invoice_id["id"]
        payload = {
            "clientName": invoice_id["clientName"],
            "clientStreet": invoice_id.get("clientStreet", ""),
            "clientZip": invoice_id.get("clientZip", ""),
            "clientCity": invoice_id.get("clientCity", ""),
            "items": [{"description": "Solo", "quantity": 5, "unitPrice": 200.0}],
            "vatRate": 8.1,
        }
        r = requests.put(f"{API}/admin/invoices/{iid}", json=payload, headers=auth, timeout=20)
        assert r.status_code == 200, r.text
        inv = r.json()
        assert abs(float(inv["subtotal"]) - 1000.0) < 0.01

    def test_invoice_pdf(self, invoice_id, auth):
        iid = invoice_id["id"]
        r = requests.get(f"{API}/admin/invoices/{iid}/pdf", headers=auth, timeout=60)
        assert r.status_code == 200, r.text[:300]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert len(r.content) > 1000
        assert r.content[:4] == b"%PDF"

    def test_invoice_preview(self, invoice_id, auth):
        iid = invoice_id["id"]
        r = requests.get(f"{API}/admin/invoices/{iid}/preview", headers=auth, timeout=30)
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert "html" in ct.lower()
        assert len(r.text) > 100

    def test_invoice_send_smtp_not_configured(self, invoice_id, auth):
        iid = invoice_id["id"]
        r = requests.post(f"{API}/admin/invoices/{iid}/send",
                          json={"subject": "Test", "message": "Hi", "toEmail": "test@test.ch"},
                          headers=auth, timeout=30)
        # Expect graceful failure since SMTP not configured
        assert r.status_code in (200, 400, 500), r.text
        try:
            data = r.json()
        except Exception:
            data = {}
        # Should indicate ok=false or include SMTP error
        if r.status_code == 200:
            assert data.get("ok") is False, f"expected ok=false, got {data}"
            msg = (data.get("error") or data.get("message") or "").lower()
            assert "smtp" in msg or "config" in msg or "not" in msg

    def test_invoice_mark_paid(self, invoice_id, auth):
        iid = invoice_id["id"]
        r = requests.post(f"{API}/admin/invoices/{iid}/mark-paid", headers=auth, timeout=20)
        assert r.status_code == 200, r.text
        # verify status
        r2 = requests.get(f"{API}/admin/invoices/{iid}", headers=auth, timeout=20)
        assert r2.json().get("status") == "paid"

    def test_invoices_list_excludes_offers(self, auth):
        r = requests.get(f"{API}/admin/invoices", headers=auth, timeout=20)
        assert r.status_code == 200
        items = r.json()
        for it in items:
            t = it.get("type") or "invoice"
            assert t != "offer", f"offer leaked into invoices list: {it}"


# ---------- OFFERS ----------
@pytest.fixture(scope="class")
def offer_id(auth):
    payload = {
        "clientName": "TEST_OfferClient",
        "clientStreet": "Off Str 1",
        "clientZip": "8000",
        "clientCity": "Zürich",
        "clientCountry": "CH",
        "clientEmail": "off@test.ch",
        "items": [{"description": "Offer Item", "quantity": 1, "unitPrice": 500.0}],
        "vatRate": 8.1,
    }
    r = requests.post(f"{API}/admin/offers", json=payload, headers=auth, timeout=30)
    assert r.status_code in (200, 201), r.text
    return r.json()


class TestOffers:
    def test_create_offer(self, offer_id):
        o = offer_id
        assert o.get("type") == "offer", f"type mismatch: {o.get('type')}"
        num = o.get("number") or ""
        assert "RW-ANG-2026" in num or "ANG-2026" in num, f"unexpected offer number {num}"

    def test_offers_list_only_offers(self, auth):
        r = requests.get(f"{API}/admin/offers", headers=auth, timeout=20)
        assert r.status_code == 200
        items = r.json()
        for it in items:
            assert it.get("type") == "offer"

    def test_offer_pdf(self, offer_id, auth):
        oid = offer_id["id"]
        r = requests.get(f"{API}/admin/offers/{oid}/pdf", headers=auth, timeout=60)
        assert r.status_code == 200, r.text[:300]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"

    def test_offer_preview(self, offer_id, auth):
        oid = offer_id["id"]
        r = requests.get(f"{API}/admin/offers/{oid}/preview", headers=auth, timeout=30)
        assert r.status_code == 200
        assert "html" in r.headers.get("content-type", "").lower()
