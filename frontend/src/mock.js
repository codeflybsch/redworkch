// Statische Mock-Daten – nur für Hero-Slider & Stats (alles andere kommt aus dem Backend)

export const heroSlides = [
  { highlight: "Unternehmens", word: "Webauftritt" },
  { highlight: "E-Commerce", word: "Lösungen" },
  { highlight: "Persönliche", word: "Websites" },
  { highlight: "Produkt", word: "Launches" },
  { highlight: "Reise", word: "Portale" },
  { highlight: "Stiftungs", word: "Websites" },
];

export const stats = [
  { number: "61.3 Mio.", suffix: "", label: "Zeilen sauberer Code" },
  { number: "415.000", suffix: "+", label: "Umgesetzte Seiten" },
  { number: "860", suffix: "+", label: "Abgeschlossene Projekte" },
  { number: "2.100", suffix: "+", label: "Langfristige Kunden" },
];

export const workSteps = [
  {
    color: "#2196F3",
    title: "Planung",
    desc: "Wir schärfen Zielsetzung, Umfang und Prioritäten, bevor die erste Zeile Code geschrieben wird.",
    icon: "presentation",
  },
  {
    color: "#FF6B35",
    title: "Visuelles Design",
    desc: "Aus Konzept, Typografie und Seitenstruktur entsteht ein konsistentes Erscheinungsbild mit Charakter.",
    icon: "palette",
  },
  {
    color: "#22C55E",
    title: "Programmierung",
    desc: "Wir entwickeln die Oberfläche so, dass Design, Funktion und Ladezeiten präzise zusammenspielen.",
    icon: "code",
  },
  {
    color: "#EF4444",
    title: "SEO-Optimierung",
    desc: "Technische und inhaltliche SEO wird von Beginn an mitgedacht, nicht erst nach dem Launch.",
    icon: "rocket",
  },
  {
    color: "#A855F7",
    title: "Tests & Qualität",
    desc: "Wir prüfen jedes Detail auf Mobilgeräten, Tablets und Desktop-Displays, bis das Ergebnis sitzt.",
    icon: "shield-check",
  },
  {
    color: "#06B6D4",
    title: "Veröffentlichung",
    desc: "Zum Schluss übernehmen wir Deployment, Domain, Hosting und den sauberen Go-live.",
    icon: "globe",
  },
];

export const features = [
  { title: "Markenauftritt mit Klarheit", desc: "Wir entwickeln digitale Auftritte, die nicht austauschbar wirken, sondern eine klare Haltung zeigen." },
  { title: "Konsequent mobil gedacht", desc: "Jede Seite ist für Smartphone, Tablet und Desktop sauber komponiert und leicht bedienbar." },
  { title: "Sauber strukturierter Code", desc: "Technisch nachvollziehbar aufgebaut, wartbar und auf zukünftige Erweiterungen vorbereitet." },
  { title: "Tempo ohne Kompromisse", desc: "Wir setzen auf performante Umsetzung, damit Ihre Website nicht nur gut aussieht, sondern auch schnell lädt." },
  { title: "Technisch suchmaschinenfreundlich", desc: "Saubere Struktur, richtige Signale und eine Basis, die Google versteht." },
  { title: "SEO von Anfang an mitgedacht", desc: "Sichtbarkeit entsteht bei uns nicht als Zusatz, sondern als Teil der Konzeption." },
];

export const reasons = [
  { title: "Erfahrenes Team", desc: "Mehr als zehn Jahre Projekterfahrung sorgen dafür, dass Strategie, Design und Umsetzung ineinandergreifen." },
  { title: "Moderne Technologien", desc: "Wir arbeiten mit aktuellen, bewährten Technologien wie React, PHP und WordPress, damit Ihr Projekt sauber tragfähig bleibt." },
  { title: "Design mit Substanz", desc: "Statt austauschbarer Vorlagen entwickeln wir einen Auftritt, der präzise zu Ihrer Marke passt." },
  { title: "Schnelle Umsetzung", desc: "Ein klarer Prozess, kurze Wege und saubere Entwicklung sparen Zeit, ohne an Qualität einzubüßen." },
  { title: "Corporate Webdesign", desc: "Wir übersetzen Ihre Markenidentität in eine digitale Sprache, die professionell und konsistent wirkt." },
  { title: "Digitale Sichtbarkeit", desc: "Von SEO bis Performance-Marketing: Wir denken Reichweite als Teil der Gesamtstrategie." },
  { title: "Individuelle Lösungen", desc: "Jede Marke hat andere Anforderungen. Deshalb entstehen bei uns keine Standardpakete, sondern passgenaue Konzepte." },
  { title: "E-Commerce-Kompetenz", desc: "Verkaufsstarke Shops und strukturierte Produktwelten, die für Nutzer und Suchmaschinen sauber funktionieren." },
  { title: "Performance-Marketing", desc: "Mit Google Ads und Social Ads bringen wir Botschaften dorthin, wo sie Wirkung entfalten." },
  { title: "SEO mit Tiefgang", desc: "Technische Analyse, Content-Struktur und saubere Signale sorgen für nachhaltige Sichtbarkeit." },
  { title: "12 Monate Support inklusive", desc: "Nach dem Launch bleiben wir ansprechbar, begleiten Updates und unterstützen Sie im laufenden Betrieb." },
  { title: "Faire Konditionen", desc: "Premium-Qualität muss nicht unnötig kompliziert sein. Wir kalkulieren klar und nachvollziehbar." },
];

export const navItems = [
  { label: "Start", href: "#top" },
  { label: "Leistungen", href: "#leistungen" },
  { label: "Hosting", href: "#hosting" },
  { label: "Auktionen", href: "#domain-auctions" },
  { label: "Projekte", href: "#projekte" },
  { label: "Über uns", href: "#ueber" },
  { label: "Kontakt", href: "#kontakt" },
];

export const footerLinks = [
  "Unternehmens-Webdesign",
  "AMP-Webdesign",
  "Persönliche Website",
  "Produktwebsite",
  "E-Commerce-Website",
  "Reise & Organisation",
  "Stiftung & Verein",
  "Web-Software",
  "Web-Beratung",
  "Social-Media-Beratung",
  "Logo-Design",
  "Corporate Identity",
  "Suchmaschinenoptimierung",
  "Social-Media-Werbung",
  "Google Adwords",
  "Marken & Patentregistrierung",
];

// Service-Typen für Angebot-Wizard
export const serviceTypes = [
  { id: "corporate", label: "Unternehmens-Website", icon: "Building2" },
  { id: "ecommerce", label: "E-Commerce / Online-Shop", icon: "ShoppingBag" },
  { id: "personal", label: "Persönliche Website", icon: "User" },
  { id: "landing", label: "Landing-Page / Produkt", icon: "Rocket" },
  { id: "webapp", label: "Web-Anwendung / SaaS", icon: "Layers" },
  { id: "redesign", label: "Redesign / Relaunch", icon: "Sparkles" },
  { id: "seo", label: "SEO-Optimierung", icon: "Search" },
  { id: "ads", label: "Google / Social Ads", icon: "Megaphone" },
  { id: "branding", label: "Logo & Corporate Identity", icon: "Award" },
];

export const budgetRanges = [
  { id: "lt5k", label: "Bis 5.000 CHF" },
  { id: "5to10k", label: "5.000 – 10.000 CHF" },
  { id: "10to25k", label: "10.000 – 25.000 CHF" },
  { id: "25to50k", label: "25.000 – 50.000 CHF" },
  { id: "gt50k", label: "Über 50.000 CHF" },
  { id: "open", label: "Noch nicht festgelegt" },
];

export const timelineOptions = [
  { id: "asap", label: "So schnell wie möglich" },
  { id: "1month", label: "Innerhalb 1 Monat" },
  { id: "3months", label: "1 – 3 Monate" },
  { id: "6months", label: "3 – 6 Monate" },
  { id: "flexible", label: "Flexibel" },
];
