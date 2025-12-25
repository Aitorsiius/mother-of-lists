import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (text: string, color?: string) => void;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

const PRESET_COLORS = [
  { name: "noColor", value: "" },
  { name: "red", value: "#ff9999" },
  { name: "pink", value: "#ff99cc" },
  { name: "purple", value: "#cc99ff" },
  { name: "blue", value: "#99ccff" },
  { name: "green", value: "#99ff99" },
  { name: "yellow", value: "#ffff99" },
  { name: "orange", value: "#ffcc99" },
];

export function AddItemDialog({ open, onOpenChange, onAdd, translations: t }: AddItemDialogProps) {
  const [text, setText] = useState("");
  const [color, setColor] = useState("");

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim(), color || undefined);
      setText("");
      setColor("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm dark:bg-dark-surface dark:border-dark-border">
        <DialogHeader>
          <DialogTitle>{t.addNewItem}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-text" className="dark:text-white">{t.itemName}</Label>
            <Input
              id="item-text"
              placeholder={t.itemNamePlaceholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdd();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.backgroundColor}</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setColor(preset.value)}
                  className={`h-10 rounded-md border-2 transition-all ${
                    color === preset.value
                      ? "border-blue-500 scale-105"
                      : "border-gray-300"
                  }`}
                  style={{
                    backgroundColor: preset.value || "#ffffff",
                  }}
                  title={t[preset.name as keyof typeof t] as string}
                >
                  {!preset.value && (
                    <span className="text-xs text-gray-400">✕</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
            {t.cancel}
          </Button>
          <Button onClick={handleAdd} disabled={!text.trim()} className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:border-blue-500 shadow-sm">
            {t.add}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
