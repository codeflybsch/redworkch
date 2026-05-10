import React from "react";
import CrudManager from "./CrudManager";

export default function BlogsAdmin() {
  return (
    <CrudManager
      title="Blog-Beiträge"
      resource="blogs"
      publicResource="blogs"
      empty={{ title: "", category: "", img: "", excerpt: "", content: "", date: "", order: 0 }}
      fields={[
        { key: "title", label: "Titel", required: true },
        { key: "category", label: "Kategorie", required: true, hint: "z.B. Webdesign, SEO, Softwareentwicklung" },
        { key: "img", label: "Titelbild-URL", required: true },
        { key: "date", label: "Datum", required: true, hint: "z.B. 15. März 2026" },
        { key: "excerpt", label: "Kurzbeschreibung", type: "textarea", rows: 2 },
        { key: "content", label: "Inhalt", type: "textarea", rows: 8 },
        { key: "order", label: "Reihenfolge", type: "number" },
      ]}
      columns={[
        {
          key: "img",
          label: "Bild",
          render: (it) => <img src={it.img} alt={it.title} className="w-16 h-12 object-cover rounded-lg" />,
        },
        { key: "title", label: "Titel" },
        { key: "category", label: "Kategorie" },
        { key: "date", label: "Datum" },
      ]}
    />
  );
}
