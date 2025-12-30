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

interface ConfirmLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  listName: string;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function ConfirmLeaveDialog({
  open,
  onOpenChange,
  onConfirm,
  listName,
  translations: t,
}: ConfirmLeaveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm dark:bg-dark-surface dark:border-dark-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white">{t.leaveListTitle}</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-300">
            {t.leaveListDesc.replace("{name}", listName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
            {t.cancel}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white border border-red-700 dark:border-red-500 shadow-sm"
          >
            {t.leave}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}