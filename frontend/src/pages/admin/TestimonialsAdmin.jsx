import React from "react";
import CrudManager from "./CrudManager";
import { Star } from "lucide-react";

export default function TestimonialsAdmin() {
  return (
    <CrudManager
      title="Kundenbewertungen"
      resource="testimonials"
      publicResource="testimonials"
      empty={{ name: "", company: "", text: "", rating: 5, order: 0 }}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "company", label: "Firma / Ort" },
        { key: "text", label: "Bewertung", type: "textarea", rows: 5, required: true },
        {
          key: "rating",
          label: "Sternebewertung",
          type: "select",
          options: [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} Sterne` })),
        },
        { key: "order", label: "Reihenfolge", type: "number" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "company", label: "Firma" },
        {
          key: "rating",
          label: "Sterne",
          render: (it) => (
            <div className="flex gap-0.5">
              {Array.from({ length: it.rating || 5 }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Star key={`star-${it.id}-${i}`} size={13} className="text-[#FFC107] fill-[#FFC107]" />
              ))}
            </div>
          ),
        },
        { key: "text", label: "Text", render: (it) => <span className="line-clamp-2 text-[13px] text-[#475569]">{it.text}</span> },
      ]}
    />
  );
}
