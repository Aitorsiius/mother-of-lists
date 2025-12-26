import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Users, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as firestoreService from "../../services/firestore";
import { User } from "../../types";

interface ParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  sharedWith: string[];
  currentUserId: string;
  listId: string;
  onRemoveParticipant?: (userId: string) => void;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function ParticipantsDialog({
  open,
  onOpenChange,
  ownerId,
  sharedWith,
  currentUserId,
  listId,
  onRemoveParticipant,
  translations: t,
}: ParticipantsDialogProps) {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  
  const isOwner = currentUserId === ownerId;

  useEffect(() => {
    const loadParticipants = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const allUserIds = [ownerId, ...sharedWith];
        const usersPromises = allUserIds.map(id => firestoreService.getUser(id));
        const users = await Promise.all(usersPromises);
        
        setParticipants(users.filter((user): user is User => user !== null));
      } catch (error) {
        console.error("Error cargando participantes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, [open, ownerId, sharedWith]);
  
  const handleRemoveParticipant = async (userId: string) => {
    if (!isOwner || userId === ownerId) return;
    
    setRemoving(userId);
    try {
      await firestoreService.removeUserFromList(listId, userId);
      
      // Actualizar estado local para animación inmediata
      setParticipants(prev => prev.filter(p => p.id !== userId));
      
      if (onRemoveParticipant) {
        onRemoveParticipant(userId);
      }
    } catch (error) {
      console.error("Error eliminando participante:", error);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-dark-surface dark:border-dark-border overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.participantsDialog}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.loading}</p>
          ) : (
            <AnimatePresence mode="popLayout">
              {participants.length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 dark:text-gray-400 py-4"
                >
                  {t.noParticipants}
                </motion.p>
              ) : (
                participants.map((user, index) => (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ 
                      layout: {
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25,
                        mass: 0.5
                      },
                      exit: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        duration: 0.4
                      }
                    }}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium dark:text-white">{user.name}</span>
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {t.creator}
                        </span>
                      )}
                    </div>
                    {isOwner && user.id !== ownerId && (
                      <button
                        onClick={() => handleRemoveParticipant(user.id)}
                        disabled={removing !== null}
                        className="p-2 text-red-500 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all disabled:opacity-50 shadow-sm active:scale-90"
                        title={t.remove}
                      >
                        {removing === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
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
