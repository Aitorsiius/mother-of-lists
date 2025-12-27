import { Checkbox } from "./ui/checkbox";
import { ListItem } from "../../types";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import * as React from "react";

interface ListItemComponentProps {
  item: ListItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ListItemComponent = React.forwardRef<HTMLDivElement, ListItemComponentProps>(
  function ListItemComponent({ item, onToggle, onDelete }, ref) {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ 
          x: "100%",
          opacity: 0,
          scale: 0
        }}
        transition={{
          layout: { type: "spring", stiffness: 300, damping: 30 },
          
          exit: { 
            duration: 0.2,
            ease: "anticipate"
          },
          
          // Entrada estándar
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        }}
        className="flex items-start gap-3 p-4 rounded-xl border-2 shadow-md hover:shadow-lg transition-shadow transform"
        style={{ 
          backgroundColor: item.color || '#f0f9ff',
          borderColor: item.color ? `color-mix(in srgb, ${item.color} 70%, #000 30%)` : '#bae6fd',
          transformOrigin: "center left"
        }}
      >
        <Checkbox
          id={item.id}
          checked={item.checked}
          onCheckedChange={() => onToggle(item.id)}
          className="flex-shrink-0 mt-0.5"
        />
        <label
          htmlFor={item.id}
          className={`flex-1 cursor-pointer break-all leading-relaxed text-gray-900 font-medium transition-all duration-300 ${
            item.checked ? 'line-through opacity-60' : ''
          }`}
        >
          {item.text}
        </label>
        <button
          onClick={() => onDelete(item.id)}
          className="flex-shrink-0 p-2 bg-white hover:bg-red-50 rounded-lg transition-colors text-red-600 mt-0.5 shadow-md hover:shadow-lg z-10"
          title="Eliminar elemento"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }
);