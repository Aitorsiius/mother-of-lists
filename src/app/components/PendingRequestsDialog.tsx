import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { UserPlus, Check, X } from "lucide-react";
import * as firestoreService from "../../services/firestore";
import { User } from "../../types";

interface PendingRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingRequests: string[];
  listId: string;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function PendingRequestsDialog({
  open,
  onOpenChange,
  pendingRequests,
  listId,
  translations: t,
}: PendingRequestsDialogProps) {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      if (!open || pendingRequests.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const usersPromises = pendingRequests.map(id => firestoreService.getUser(id));
        const users = await Promise.all(usersPromises);
        
        setRequests(users.filter((user): user is User => user !== null));
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [open, pendingRequests]);

  const handleApprove = async (userId: string) => {
    setProcessing(userId);
    try {
      await firestoreService.approvePendingRequest(listId, userId);
    } catch (error) {
      console.error("Error aprobando solicitud:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessing(userId);
    try {
      await firestoreService.rejectPendingRequest(listId, userId);
    } catch (error) {
      console.error("Error rechazando solicitud:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-dark-surface dark:border-dark-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t.pendingRequestsDialog}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.loading}</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.noPendingRequests}</p>
          ) : (
            requests.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
              >
                <span className="font-medium dark:text-white">{user.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processing === user.id}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-white disabled:opacity-50 shadow-sm"
                    title={t.approve}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={processing === user.id}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors text-white disabled:opacity-50 shadow-sm"
                    title={t.reject}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
