import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ConfirmUncheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function ConfirmUncheckDialog({
  open,
  onOpenChange,
  onConfirm,
  translations: t,
}: ConfirmUncheckDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm dark:bg-dark-surface dark:border-dark-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white">{t.uncheckAllTitle}</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-300">
            {t.uncheckAllDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">{t.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:border-blue-500 shadow-sm">
            {t.uncheck}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
