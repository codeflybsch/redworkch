import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import api from "../api";

/**
 * Generic drag & drop list with order persistence.
 * Props:
 *   collection: API collection slug (e.g. "projects", "faqs", "products")
 *   items: items list (must have id + order)
 *   onChange: called with new ordered items
 *   renderItem: (item, dragHandleProps) => JSX
 */
export default function DraggableList({ collection, items, onChange, renderItem, idKey = "id" }) {
  const [list, setList] = useState(items);
  useEffect(() => { setList(items); }, [items]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(list);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setList(reordered);
    onChange?.(reordered);
    try {
      await api.post(`/admin/${collection}/reorder`, { ids: reordered.map((i) => i[idKey]) });
    } catch (e) { /* silent – local state already updated */ }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={`d-${collection}`}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
            {list.map((it, idx) => (
              <Draggable key={it[idKey]} draggableId={String(it[idKey])} index={idx}>
                {(prov, snapshot) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    className={`bg-white rounded-xl border ${snapshot.isDragging ? "border-[#E63946] shadow-2xl" : "border-slate-200"}`}
                  >
                    <div className="flex items-stretch">
                      <div
                        {...prov.dragHandleProps}
                        className="px-3 flex items-center text-slate-400 hover:text-[#E63946] cursor-grab active:cursor-grabbing"
                        title="Ziehen zum Sortieren"
                      >
                        <GripVertical size={18} />
                      </div>
                      <div className="flex-1 min-w-0 py-2 pr-2">{renderItem(it, prov.dragHandleProps)}</div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
