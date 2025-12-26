import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, User } from "../../types";
import { AddListCodeDialog } from "./AddListCodeDialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Key, Users, Moon, Sun, Languages, Heart } from "lucide-react";
import { Browser } from "@capacitor/browser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import type { Language } from "../../utils/translations";

interface MainViewProps {
  user: User;
  lists: List[];
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onJoinList: (code: string) => void;
  onUpdateUserName: (name: string) => void;
  onToggleTheme: () => void;
  theme: "light" | "dark";
  onToggleLanguage: () => void;
  language: Language;
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function MainView({
  user,
  lists,
  onSelectList,
  onCreateList,
  onJoinList,
  onUpdateUserName,
  onToggleTheme,
  theme,
  onToggleLanguage,
  language,
  translations: t,
}: MainViewProps) {
  const [showAddCode, setShowAddCode] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editedUserName, setEditedUserName] = useState(user.name);

  const sortedLists = [...lists].sort((a, b) => {
    const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
    const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const myLists = sortedLists.filter((list) => list.ownerId === user.id);
  const sharedLists = sortedLists.filter((list) => list.ownerId !== user.id);

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName("");
      setShowCreateList(false);
    }
  };

  const handleUpdateUserName = () => {
    if (editedUserName.trim()) {
      onUpdateUserName(editedUserName.trim());
      setShowEditUser(false);
    }
  };

  const getListStats = (list: List) => {
    const totalItems = list.items.length;
    const totalUsers = 1 + list.sharedWith.length;
    return { totalItems, totalUsers };
  };

  const handleDonation = async () => {
    await Browser.open({ 
      url: "https://www.paypal.com/donate/?hosted_button_id=UC2XH84REL3JA"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4 sticky top-0 z-10" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleDonation}
                className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                title={language === "es" ? "Apoyar con una donación" : "Support with a donation"}
              >
                <Heart className="w-6 h-6 text-red-500 dark:text-red-400" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onToggleLanguage}
                className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                title={language === "es" ? "English" : "Español"}
              >
                <Languages className="w-6 h-6 dark:text-white" />
              </button>
              <button
                onClick={onToggleTheme}
                className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                title={theme === "light" ? t.darkMode : t.lightMode}
              >
                {theme === "light" ? (
                  <Moon className="w-6 h-6 dark:text-white" />
                ) : (
                  <Sun className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={() => setShowAddCode(true)}
                className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                title={t.joinList}
              >
                <Key className="w-6 h-6 dark:text-white" />
              </button>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateList(true)}
            className="w-full"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.newList}
          </Button>
        </div>
      </div>

      {/* Lists */}
      <div className="p-4 pb-32 max-w-md mx-auto w-full">
        {/* Mis Listas */}
        {myLists.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-gray-600 dark:text-gray-400 font-semibold">{t.myListsSection}</h2>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {myLists.map((list) => {
                  const { totalItems, totalUsers } = getListStats(list);
                  return (
                    <motion.button
                      layout
                      key={list.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25,
                        mass: 0.5
                      }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onSelectList(list.id)}
                      className="w-full p-5 bg-white dark:bg-dark-surface rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-blue-400 dark:hover:border-blue-500 shadow-md hover:shadow-xl transition-colors text-left"
                    >
                    <h3 className="mb-2 dark:text-white font-semibold text-lg">{list.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{totalItems}</span>
                        <span>{totalItems !== 1 ? t.items : t.item}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">{totalUsers}</span>
                      </span>
                    </div>
                  </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Listas de Otros Usuarios */}
        {sharedLists.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-gray-600 dark:text-gray-400 font-semibold">{t.sharedListsSection}</h2>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {sharedLists.map((list) => {
                  const { totalItems, totalUsers } = getListStats(list);
                  return (
                    <motion.button
                      layout
                      key={list.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25,
                        mass: 0.5
                      }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onSelectList(list.id)}
                      className="w-full p-5 bg-white dark:bg-dark-surface rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-blue-400 dark:hover:border-blue-500 shadow-md hover:shadow-xl transition-colors text-left"
                    >
                    <h3 className="mb-2 dark:text-white font-semibold text-lg">{list.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{totalItems}</span>
                        <span>{totalItems !== 1 ? t.items : t.item}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">{totalUsers}</span>
                      </span>
                    </div>
                  </motion.button>
                );
              })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {lists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t.noListsYet}
            </p>
          </div>
        )}
      </div>

      {/* Footer con usuario */}
      <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border p-4 pb-6 fixed bottom-0 left-0 right-0 z-10" style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={() => {
              if (!user.nameSet) {
                setEditedUserName(user.name);
                setShowEditUser(true);
              }
            }}
            className={`w-full text-center p-2 rounded-lg transition-colors ${
              user.nameSet 
                ? 'cursor-default' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            disabled={user.nameSet}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.user}</p>
            <p className={user.nameSet ? "text-gray-800 dark:text-gray-200" : "text-blue-600 hover:underline"}>
              {user.name}
            </p>
            {user.nameSet && (
              <p className="text-xs text-gray-400 mt-1">{t.nameEstablished}</p>
            )}
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <AddListCodeDialog
        open={showAddCode}
        onOpenChange={setShowAddCode}
        onAdd={onJoinList}
        translations={t}
      />

      <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
        <DialogContent className="max-w-sm dark:bg-dark-surface dark:border-dark-border">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t.createNewList}</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {t.createNewListDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="list-name" className="dark:text-white">{t.listName}</Label>
              <Input
                id="list-name"
                placeholder={t.listNamePlaceholder}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateList();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateList(false)} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
              {t.cancel}
            </Button>
            <Button onClick={handleCreateList} disabled={!newListName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:border-blue-500 shadow-sm">
              {t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-sm dark:bg-dark-surface dark:border-dark-border">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t.setUsername}</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {t.setUsernameDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name" className="dark:text-white">{t.name}</Label>
              <Input
                id="user-name"
                placeholder={t.namePlaceholder}
                value={editedUserName}
                onChange={(e) => setEditedUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateUserName();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUser(false)} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm">
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateUserName} disabled={!editedUserName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:border-blue-500 shadow-sm">
              {t.setName}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
