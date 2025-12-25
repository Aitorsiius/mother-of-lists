import { useState } from "react";
import { List, ListItem } from "../../types";
import { ListItemComponent } from "./ListItemComponent";
import { AddItemDialog } from "./AddItemDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { ConfirmUncheckDialog } from "./ConfirmUncheckDialog";
import { ParticipantsDialog } from "./ParticipantsDialog";
import { PendingRequestsDialog } from "./PendingRequestsDialog";
import { Button } from "./ui/button";
import { ArrowLeft, Trash2, Plus, Users, CheckCheck, UserPlus } from "lucide-react";
import { sortItems } from "../../utils/sortItems";

interface ListViewProps {
  list: List;
  currentUserId: string;
  onBack: () => void;
  onUpdateList: (list: List) => void;
  onDeleteList: (listId: string) => void;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function ListView({
  list,
  currentUserId,
  onBack,
  onUpdateList,
  onDeleteList,
  translations: t,
}: ListViewProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showUncheckAllConfirm, setShowUncheckAllConfirm] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);

  const sortedItems = sortItems(list.items);
  const participantCount = 1 + list.sharedWith.length;
  const isOwner = list.ownerId === currentUserId;

  const handleToggleItem = (itemId: string) => {
    const updatedItems = list.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    
    onUpdateList({ ...list, items: updatedItems, updatedAt: new Date() });
  };

  const handleAddItem = (text: string, color?: string) => {
    const newItem: ListItem = {
      id: crypto.randomUUID(),
      text,
      color,
      checked: false,
    };

    const updatedItems = [...list.items, newItem];
    onUpdateList({ ...list, items: updatedItems, updatedAt: new Date() });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = list.items.filter((item) => item.id !== itemId);
    onUpdateList({ ...list, items: updatedItems, updatedAt: new Date() });
  };

  const handleUncheckAll = () => {
    const updatedItems = list.items.map((item) => ({ ...item, checked: false }));
    onUpdateList({ ...list, items: updatedItems, updatedAt: new Date() });
    setShowUncheckAllConfirm(false);
  };

  const handleDeleteList = () => {
    onDeleteList(list.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4 sticky top-0 z-10" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <div className="flex-1 mx-4">
            <h1 className="truncate dark:text-white">{list.name}</h1>
            {participantCount > 1 && (
              <button
                onClick={() => setShowParticipants(true)}
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5 hover:text-blue-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>{participantCount} {t.participants.toLowerCase()}</span>
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {isOwner && list.pendingRequests?.length > 0 && (
              <button
                onClick={() => setShowPendingRequests(true)}
                className="relative p-2 bg-white dark:bg-dark-surface border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900 rounded-lg transition-colors text-orange-600 dark:text-orange-400 shadow-sm"
                title={t.pendingRequests}
              >
                <UserPlus className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {list.pendingRequests.length}
                </span>
              </button>
            )}
            {sortedItems.some(item => item.checked) && (
              <button
                onClick={() => setShowUncheckAllConfirm(true)}
                className="p-2 bg-white dark:bg-dark-surface border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors text-blue-600 dark:text-blue-400 shadow-sm"
                title={t.uncheckAll}
              >
                <CheckCheck className="w-6 h-6" />
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-white dark:bg-dark-surface border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-red-600 dark:text-red-400 shadow-sm"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 pb-32 max-w-md mx-auto w-full">
        <div className="space-y-3">
          {sortedItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t.emptyList}</p>
              <Button onClick={() => setShowAddItem(true)}>
                <Plus className="w-5 h-5 mr-2" />
                {t.addItem}
              </Button>
            </div>
          ) : (
            <>
              {sortedItems.map((item) => (
                <ListItemComponent
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                />
              ))}
              <Button
                onClick={() => setShowAddItem(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t.addItem}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Footer con código */}
      <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border p-4 pb-6 fixed bottom-0 left-0 right-0 z-10" style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}>
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.listCode}</p>
          <p className="text-3xl tracking-widest dark:text-white">{list.code}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t.enterListCodeDesc}
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <AddItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onAdd={handleAddItem}
        translations={t}
      />

      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteList}
        listName={list.name}
        translations={t}
      />

      <ConfirmUncheckDialog
        open={showUncheckAllConfirm}
        onOpenChange={setShowUncheckAllConfirm}
        onConfirm={handleUncheckAll}
        translations={t}
      />

      <ParticipantsDialog
        open={showParticipants}
        onOpenChange={setShowParticipants}
        ownerId={list.ownerId}
        sharedWith={list.sharedWith}
        currentUserId={currentUserId}
        listId={list.id}
        translations={t}
      />

      <PendingRequestsDialog
        open={showPendingRequests}
        onOpenChange={setShowPendingRequests}
        pendingRequests={list.pendingRequests || []}
        listId={list.id}
        translations={t}
      />
    </div>
  );
}
