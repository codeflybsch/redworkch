import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle2, Eye, Globe2, GripVertical, Loader2,
  Plus, Save, Server, Trash2, X
} from "lucide-react";
import api from "../../api";

const DEFAULT_GENERAL = ["cPanel Kontrollpanel", "LiteSpeed Web Server", "CloudLinux & CageFS", "Wöchentliche Backups", "PHP 5.3 - 8.5"];
const DEFAULT_TABS = [
  { key: "all", label: "Alle Pakete" },
  { key: "economic", label: "Basis Hosting" },
  { key: "business", label: "Business Hosting" },
];

const PACKAGE_TEMPLATE = {
  id: "",
  name: "Neues Paket",
  description: "Professionelles Hosting-Paket für Websites und Unternehmen.",
  monthlyPrice: 0,
  yearlyPrice: 0,
  twentyFourPrice: 0,
  thirtySixPrice: 0,
  tag: "economic",
  tagLabel: "Basis Hosting",
  featured: false,
  enabled: true,
  order: 0,
  features: ["10 GB SSD Disk", "250 GB Traffic", "2 vCPU", "2 GB RAM", "50 E-Mail-Konten"],
  generalFeatures: DEFAULT_GENERAL,
};

const DOMAIN_TEMPLATE = {
  domain: "",
  category: "Premium",
  currentBid: 0,
  buyNow: 0,
  transferFee: 49,
  bids: 0,
  status: "live",
  reference: "",
  endsIn: "Live",
};

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100";
const buttonDark = "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50";
const buttonRed = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#E63946] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#c5303d] disabled:opacity-50";

const toLines = (value) => Array.isArray(value) ? value.join("\n") : "";
const fromLines = (value) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const slug = (value) => String(value || "paket").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const money = (value) => new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function HostingDomainAdmin() {
  const [settings, setSettings] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("hosting");
  const [feedback, setFeedback] = useState(null);
  const [domainEdit, setDomainEdit] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, domainsRes] = await Promise.all([
        api.get("/site-settings"),
        api.get("/admin/domain-auctions"),
      ]);
      const data = settingsRes.data || {};
      setSettings({
        ...data,
        hostingBadge: data.hostingBadge || "Hosting & Server",
        hostingTitle: data.hostingTitle || "Professionelle Hosting-Pakete",
        hostingSubtitle: data.hostingSubtitle || "Schnelle, sichere und skalierbare Hosting-Lösungen für Websites, Unternehmen und E-Commerce-Projekte.",
        hostingTabs: data.hostingTabs?.length ? data.hostingTabs : DEFAULT_TABS,
        hostingPackages: data.hostingPackages?.length ? data.hostingPackages : [],
      });
      setDomains(Array.isArray(domainsRes.data) ? domainsRes.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const packages = settings?.hostingPackages || [];
  const enabledCount = packages.filter((item) => item.enabled !== false).length;
  const featuredCount = packages.filter((item) => item.featured).length;
  const domainLiveCount = domains.filter((item) => item.status === "live").length;
  const totalDomainValue = useMemo(() => domains.reduce((sum, item) => sum + Number(item.buyNow || 0), 0), [domains]);

  const updateSetting = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const updatePackage = (index, patch) => updateSetting("hostingPackages", packages.map((item, i) => i === index ? { ...item, ...patch } : item));

  const addPackage = () => {
    const nextOrder = packages.reduce((max, item) => Math.max(max, Number(item.order || 0)), 0) + 1;
    updateSetting("hostingPackages", [...packages, { ...PACKAGE_TEMPLATE, id: `hosting-${Date.now()}`, order: nextOrder }]);
  };

  const removePackage = (index) => {
    if (!window.confirm("Dieses Hosting-Paket wirklich löschen?")) return;
    updateSetting("hostingPackages", packages.filter((_, i) => i !== index));
  };

  const saveHosting = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const normalized = {
        ...settings,
        hostingPackages: packages.map((item, index) => ({
          ...item,
          id: item.id || slug(item.name),
          monthlyPrice: Number(item.monthlyPrice || 0),
          yearlyPrice: Number(item.yearlyPrice || 0),
          twentyFourPrice: Number(item.twentyFourPrice || 0),
          thirtySixPrice: Number(item.thirtySixPrice || 0),
          order: Number(item.order || index + 1),
        })),
      };
      await api.put("/admin/site-settings", normalized);
      setSettings(normalized);
      setFeedback({ type: "ok", text: "Hosting-Bereich gespeichert. Die Startseite nutzt diese Daten direkt." });
    } catch (err) {
      setFeedback({ type: "err", text: err.response?.data?.detail || "Hosting konnte nicht gespeichert werden." });
    } finally {
      setSaving(false);
    }
  };

  const saveDomain = async () => {
    if (!domainEdit?.domain) return;
    setSaving(true);
    try {
      const payload = {
        ...domainEdit,
        currentBid: Number(domainEdit.currentBid || 0),
        buyNow: Number(domainEdit.buyNow || 0),
        transferFee: Number(domainEdit.transferFee || 0),
        bids: Number(domainEdit.bids || 0),
      };
      if (payload.id) {
        await api.put(`/admin/domain-auctions/${payload.id}`, payload);
      } else {
        await api.post("/admin/domain-auctions", payload);
      }
      setDomainEdit(null);
      await load();
      setFeedback({ type: "ok", text: "Domain-Auktion gespeichert." });
    } catch (err) {
      setFeedback({ type: "err", text: err.response?.data?.detail || "Domain konnte nicht gespeichert werden." });
    } finally {
      setSaving(false);
    }
  };

  const removeDomain = async (item) => {
    if (!window.confirm(`${item.domain} wirklich entfernen?`)) return;
    await api.delete(`/admin/domain-auctions/${item.id}`);
    await load();
  };

  if (loading || !settings) return <div className="p-12 text-center"><Loader2 className="mx-auto animate-spin" /></div>;

  return (
    <div data-testid="hosting-domain-admin" className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#172554] to-[#2563eb] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">Services</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Hosting & Domain Verwaltung</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">Hosting-Pakete, Preise, Features und Domain-Auktionen werden hier zentral gepflegt und direkt auf der Website ausgespielt.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/#hosting" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15"><Eye size={16} /> Hosting ansehen</a>
            <a href="/domains" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-blue-50"><Globe2 size={16} /> Domains ansehen</a>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`flex items-start gap-2 rounded-2xl border p-4 text-sm ${feedback.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {feedback.type === "ok" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Aktive Hosting-Pakete" value={enabledCount} icon={Server} />
        <Metric label="Empfohlene Pakete" value={featuredCount} icon={CheckCircle2} />
        <Metric label="Live Domains" value={domainLiveCount} icon={Globe2} />
        <Metric label="Domain-Wert" value={money(totalDomainValue)} icon={Save} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab("hosting")} className={`rounded-xl px-5 py-3 text-sm font-black ${tab === "hosting" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>Hosting-Pakete</button>
        <button onClick={() => setTab("domains")} className={`rounded-xl px-5 py-3 text-sm font-black ${tab === "domains" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>Domain-Auktionen</button>
      </div>

      {tab === "hosting" ? (
        <HostingEditor
          settings={settings}
          packages={packages}
          updateSetting={updateSetting}
          updatePackage={updatePackage}
          addPackage={addPackage}
          removePackage={removePackage}
          saveHosting={saveHosting}
          saving={saving}
        />
      ) : (
        <DomainEditor domains={domains} setDomainEdit={setDomainEdit} removeDomain={removeDomain} />
      )}

      {domainEdit && (
        <Modal title={domainEdit.id ? "Domain bearbeiten" : "Neue Domain-Auktion"} onClose={() => setDomainEdit(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Domain"><input className={input} value={domainEdit.domain || ""} onChange={(e) => setDomainEdit({ ...domainEdit, domain: e.target.value })} placeholder="premium-domain.ch" /></Field>
            <Field label="Kategorie"><input className={input} value={domainEdit.category || ""} onChange={(e) => setDomainEdit({ ...domainEdit, category: e.target.value })} placeholder="Premium" /></Field>
            <Field label="Aktuelles Gebot CHF"><input type="number" className={input} value={domainEdit.currentBid || 0} onChange={(e) => setDomainEdit({ ...domainEdit, currentBid: e.target.value })} /></Field>
            <Field label="Sofortkauf CHF"><input type="number" className={input} value={domainEdit.buyNow || 0} onChange={(e) => setDomainEdit({ ...domainEdit, buyNow: e.target.value })} /></Field>
            <Field label="Transfergebühr CHF"><input type="number" className={input} value={domainEdit.transferFee || 0} onChange={(e) => setDomainEdit({ ...domainEdit, transferFee: e.target.value })} /></Field>
            <Field label="Gebote"><input type="number" className={input} value={domainEdit.bids || 0} onChange={(e) => setDomainEdit({ ...domainEdit, bids: e.target.value })} /></Field>
            <Field label="Status">
              <select className={input} value={domainEdit.status || "live"} onChange={(e) => setDomainEdit({ ...domainEdit, status: e.target.value })}>
                <option value="live">live</option>
                <option value="reserved">reserved</option>
                <option value="sold">sold</option>
                <option value="hidden">hidden</option>
              </select>
            </Field>
            <Field label="Referenz"><input className={input} value={domainEdit.reference || ""} onChange={(e) => setDomainEdit({ ...domainEdit, reference: e.target.value })} placeholder="DOM-..." /></Field>
            <Field label="Laufzeit"><input className={input} value={domainEdit.endsIn || ""} onChange={(e) => setDomainEdit({ ...domainEdit, endsIn: e.target.value })} placeholder="Live" /></Field>
          </div>
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button onClick={() => setDomainEdit(null)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-800">Abbrechen</button>
            <button onClick={saveDomain} disabled={saving || !domainEdit.domain} className={buttonRed}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Speichern</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function HostingEditor({ settings, packages, updateSetting, updatePackage, addPackage, removePackage, saveHosting, saving }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Badge"><input className={input} value={settings.hostingBadge || ""} onChange={(e) => updateSetting("hostingBadge", e.target.value)} /></Field>
          <Field label="Titel"><input className={input} value={settings.hostingTitle || ""} onChange={(e) => updateSetting("hostingTitle", e.target.value)} /></Field>
          <Field label="Untertitel"><textarea rows={3} className={`${input} md:col-span-2`} value={settings.hostingSubtitle || ""} onChange={(e) => updateSetting("hostingSubtitle", e.target.value)} /></Field>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={saveHosting} disabled={saving} className={buttonRed}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Hosting speichern</button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">Pakete</h2>
          <p className="text-sm text-slate-500">Diese Karten erscheinen im Abschnitt “Hosting-Pakete”.</p>
        </div>
        <button onClick={addPackage} className={buttonDark}><Plus size={16} /> Neues Paket</button>
      </div>

      <div className="grid gap-4">
        {packages.map((plan, index) => (
          <div key={`${plan.id}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
              <GripVertical className="text-slate-300" size={18} />
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-950">{plan.name || "Unbenanntes Paket"}</p>
                <p className="text-xs text-slate-500">{plan.tagLabel || plan.tag} · {money(plan.yearlyPrice)} / Jahr</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={plan.enabled !== false} onChange={(e) => updatePackage(index, { enabled: e.target.checked })} /> Aktiv</label>
              <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!plan.featured} onChange={(e) => updatePackage(index, { featured: e.target.checked })} /> Bestseller</label>
              <button onClick={() => removePackage(index)} className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 size={17} /></button>
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="Paket-ID"><input className={input} value={plan.id || ""} onChange={(e) => updatePackage(index, { id: e.target.value })} /></Field>
              <Field label="Name"><input className={input} value={plan.name || ""} onChange={(e) => updatePackage(index, { name: e.target.value })} /></Field>
              <Field label="Kategorie-Key"><input className={input} value={plan.tag || ""} onChange={(e) => updatePackage(index, { tag: e.target.value })} /></Field>
              <Field label="Kategorie-Label"><input className={input} value={plan.tagLabel || ""} onChange={(e) => updatePackage(index, { tagLabel: e.target.value })} /></Field>
              <Field label="Monatlich CHF"><input type="number" className={input} value={plan.monthlyPrice ?? 0} onChange={(e) => updatePackage(index, { monthlyPrice: e.target.value })} /></Field>
              <Field label="1 Jahr CHF"><input type="number" className={input} value={plan.yearlyPrice ?? 0} onChange={(e) => updatePackage(index, { yearlyPrice: e.target.value })} /></Field>
              <Field label="2 Jahre CHF"><input type="number" className={input} value={plan.twentyFourPrice ?? 0} onChange={(e) => updatePackage(index, { twentyFourPrice: e.target.value })} /></Field>
              <Field label="3 Jahre CHF"><input type="number" className={input} value={plan.thirtySixPrice ?? 0} onChange={(e) => updatePackage(index, { thirtySixPrice: e.target.value })} /></Field>
              <Field label="Reihenfolge"><input type="number" className={input} value={plan.order ?? index + 1} onChange={(e) => updatePackage(index, { order: e.target.value })} /></Field>
              <Field label="Beschreibung"><textarea rows={3} className={`${input} lg:col-span-3`} value={plan.description || ""} onChange={(e) => updatePackage(index, { description: e.target.value })} /></Field>
              <Field label="Paket-Features"><textarea rows={7} className={`${input} lg:col-span-2`} value={toLines(plan.features)} onChange={(e) => updatePackage(index, { features: fromLines(e.target.value) })} /></Field>
              <Field label="Allgemeine Features"><textarea rows={7} className={`${input} lg:col-span-2`} value={toLines(plan.generalFeatures?.length ? plan.generalFeatures : DEFAULT_GENERAL)} onChange={(e) => updatePackage(index, { generalFeatures: fromLines(e.target.value) })} /></Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DomainEditor({ domains, setDomainEdit, removeDomain }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-xl font-black text-slate-950">Domain-Auktionen</h2>
          <p className="text-sm text-slate-500">Domains, Gebote und Sofortkauf-Preise verwalten.</p>
        </div>
        <button onClick={() => setDomainEdit({ ...DOMAIN_TEMPLATE })} className={buttonDark}><Plus size={16} /> Neue Domain</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="p-4">Domain</th><th>Kategorie</th><th>Gebot</th><th>Sofortkauf</th><th>Status</th><th className="p-4 text-right">Aktion</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {domains.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4 font-black text-slate-950">{item.domain}<div className="text-xs font-semibold text-slate-400">{item.reference}</div></td>
                <td className="text-sm text-slate-600">{item.category}</td>
                <td className="font-bold">{money(item.currentBid)}</td>
                <td className="font-bold text-emerald-700">{money(item.buyNow)}</td>
                <td><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{item.status}</span></td>
                <td className="p-4 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => setDomainEdit({ ...item })} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200">Bearbeiten</button>
                    <button onClick={() => removeDomain(item)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">Löschen</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="text-blue-600" size={22} /><p className="mt-4 text-2xl font-black text-slate-950">{value}</p><p className="text-sm font-semibold text-slate-500">{label}</p></div>;
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <button onClick={onClose} className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
