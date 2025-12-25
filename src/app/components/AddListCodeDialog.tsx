import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AddListCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (code: string) => void;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function AddListCodeDialog({
  open,
  onOpenChange,
  onAdd,
  translations: t,
}: AddListCodeDialogProps) {
  const [code, setCode] = useState("");

  const handleAdd = () => {
    if (code.trim().length === 5 && /^\d{5}$/.test(code)) {
      onAdd(code.trim());
      setCode("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm dark:bg-dark-surface dark:border-dark-border">
        <DialogHeader>
          <DialogTitle>{t.enterListCode}</DialogTitle>
          <DialogDescription>
            {t.enterListCodeDesc}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-code" className="dark:text-white">{t.listCode}</Label>
            <Input
              id="list-code"
              placeholder={t.listCodePlaceholder}
              value={code}
              maxLength={5}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setCode(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdd();
                }
              }}
              className="text-center text-2xl tracking-widest"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
            {t.cancel}
          </Button>
          <Button
            onClick={handleAdd}
            disabled={code.length !== 5 || !/^\d{5}$/.test(code)}
            className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:border-blue-500 shadow-sm"
          >
            {t.join}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
