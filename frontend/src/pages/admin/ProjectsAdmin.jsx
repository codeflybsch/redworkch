import React from "react";
import CrudManager from "./CrudManager";

export default function ProjectsAdmin() {
  return (
    <CrudManager
      title="Projekte"
      resource="projects"
      publicResource="projects"
      empty={{ title: "", category: "", img: "", description: "", url: "", order: 0 }}
      fields={[
        { key: "title", label: "Titel", required: true },
        { key: "category", label: "Kategorie", required: true },
        { key: "img", label: "Bild-URL", required: true, hint: "https://..." },
        { key: "description", label: "Beschreibung", type: "textarea", rows: 3 },
        { key: "url", label: "Projekt-URL (optional)" },
        { key: "order", label: "Reihenfolge", type: "number" },
      ]}
      columns={[
        {
          key: "img",
          label: "Bild",
          render: (it) => (
            <img src={it.img} alt={it.title} className="w-16 h-12 object-cover rounded-lg" />
          ),
        },
        { key: "title", label: "Titel" },
        { key: "category", label: "Kategorie" },
        { key: "order", label: "Reihenfolge" },
      ]}
    />
  );
}
