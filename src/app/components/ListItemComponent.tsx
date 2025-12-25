import { Checkbox } from "./ui/checkbox";
import { ListItem } from "../../types";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";

interface ListItemComponentProps {
  item: ListItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ListItemComponent({ item, onToggle, onDelete }: ListItemComponentProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-4 rounded-xl border-2 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01]"
      style={{ 
        backgroundColor: item.color || '#f0f9ff',
        borderColor: item.color ? `color-mix(in srgb, ${item.color} 70%, #000 30%)` : '#bae6fd'
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
        className={`flex-1 cursor-pointer break-all leading-relaxed text-gray-900 font-medium ${
          item.checked ? 'line-through opacity-60' : ''
        }`}
      >
        {item.text}
      </label>
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 p-2 bg-white hover:bg-red-50 rounded-lg transition-colors text-red-600 mt-0.5 shadow-md hover:shadow-lg"
        title="Eliminar elemento"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
