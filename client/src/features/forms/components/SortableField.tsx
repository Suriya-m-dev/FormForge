import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface SortableFieldProps {
  id: string;
  children: ReactNode;
}

const SortableField = ({ id, children }: SortableFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex items-start gap-2"
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder field"
        className="mt-5 shrink-0 cursor-grab rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
      >
        <GripVertical size={19} />
      </button>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export default SortableField;