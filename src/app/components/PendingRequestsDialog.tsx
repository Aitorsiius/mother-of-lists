import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as firestoreService from "../../services/firestore";
import { User } from "../../types";

interface PendingRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingRequests: string[];
  listId: string;
  onApproveRequest?: (userId: string) => Promise<void>;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function PendingRequestsDialog({
  open,
  onOpenChange,
  pendingRequests,
  listId,
  onApproveRequest,
  translations: t,
}: PendingRequestsDialogProps) {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      // Si el diálogo está cerrado, no hacemos nada
      if (!open) return;

      // Si no hay solicitudes, limpiamos y quitamos loading
      if (pendingRequests.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }
      
      // Esto evita que al borrar una se vea el texto de "Cargando..."
      if (requests.length === 0) setLoading(true);

      try {
        const usersPromises = pendingRequests.map(id => firestoreService.getUser(id));
        const users = await Promise.all(usersPromises);
        const filteredUsers = users.filter((user): user is User => user !== null);
        
        setRequests(filteredUsers);
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
    // Quitamos 'pendingRequests' de las dependencias si queremos un control total manual, 
    // pero lo dejamos para que se sincronice si alguien más aprueba desde otro móvil.
  }, [open, pendingRequests.length]);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    if (!firestoreService.isConfigured() || processing) return;
    
    setProcessing(userId);
    try {
      if (action === 'approve') {
        if (onApproveRequest) await onApproveRequest(userId);
        await firestoreService.approvePendingRequest(listId, userId);
      } else {
        await firestoreService.rejectPendingRequest(listId, userId);
      }
      
      setRequests(prev => prev.filter(req => req.id !== userId));
    } catch (error) {
      console.error(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'}:`, error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-dark-surface dark:border-dark-border overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            {t.pendingRequestsDialog}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 min-h-[100px] max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">{t.loading}</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {requests.length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 dark:text-gray-400 py-8"
                >
                  {t.noPendingRequests}
                </motion.p>
              ) : (
                requests.map((user) => (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between shadow-sm"
                  >
                    <span className="font-medium dark:text-white truncate mr-2">
                      {user.name}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(user.id, 'approve')}
                        disabled={processing !== null}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all text-white disabled:opacity-50 shadow-sm active:scale-90"
                      >
                        {processing === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(user.id, 'reject')}
                        disabled={processing !== null}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all text-white disabled:opacity-50 shadow-sm active:scale-90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}