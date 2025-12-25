import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Users, Trash2 } from "lucide-react";
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
      <DialogContent className="dark:bg-dark-surface dark:border-dark-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.participantsDialog}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.loading}</p>
          ) : participants.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.noParticipants}</p>
          ) : (
            participants.map((user, index) => (
              <div
                key={user.id}
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
                    disabled={removing === user.id}
                    className="p-1 hover:bg-red-50 rounded transition-colors text-red-600 disabled:opacity-50"
                    title={t.remove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
