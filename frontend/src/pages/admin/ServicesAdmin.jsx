import React from "react";
import CrudManager from "./CrudManager";

const ICONS = ["Smartphone", "Code", "Search", "Megaphone", "Award", "MessageSquare"];

export default function ServicesAdmin() {
  return (
    <CrudManager
      title="Dienstleistungen"
      resource="services"
      publicResource="services"
      empty={{ title: "", desc: "", icon: "Smartphone", side: "left", order: 0 }}
      fields={[
        { key: "title", label: "Titel", required: true },
        { key: "desc", label: "Beschreibung", type: "textarea", rows: 4, required: true },
        {
          key: "icon",
          label: "Icon",
          type: "select",
          options: ICONS.map((i) => ({ value: i, label: i })),
        },
        {
          key: "side",
          label: "Seite",
          type: "select",
          options: [
            { value: "left", label: "Links" },
            { value: "right", label: "Rechts" },
          ],
        },
        { key: "order", label: "Reihenfolge", type: "number" },
      ]}
      columns={[
        { key: "title", label: "Titel" },
        { key: "side", label: "Seite" },
        { key: "icon", label: "Icon" },
        { key: "order", label: "Reihenfolge" },
      ]}
    />
  );
}
