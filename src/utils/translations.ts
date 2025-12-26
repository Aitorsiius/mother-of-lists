export type Language = "es" | "en";

export const translations = {
  es: {
    // MainView
    myLists: "Mis Listas",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    joinList: "Unirse a una lista",
    newList: "Nueva Lista",
    myListsSection: "Mis Listas",
    sharedListsSection: "Listas de Otros Usuarios",
    noListsYet: "No tienes listas todavía. Crea una nueva lista o únete a una existente.",
    user: "Usuario",
    nameEstablished: "Nombre establecido",
    items: "elementos",
    item: "elemento",
    
    // ListView
    participants: "Participantes",
    pendingRequests: "Solicitudes Pendientes",
    uncheckAll: "Desmarcar todos",
    deleteList: "Eliminar lista",
    back: "Volver",
    addItem: "Agregar elemento",
    emptyList: "No hay elementos en esta lista todavía",
    editListName: "Editar nombre de la lista",
    save: "Guardar",
    close: "Cerrar",
    
    // Dialogs
    createNewList: "Crear nueva lista",
    createNewListDesc: "Dale un nombre a tu nueva lista de compras",
    listName: "Nombre de la lista",
    listNamePlaceholder: "Ej: Compra del mes",
    cancel: "Cancelar",
    create: "Crear",
    
    setUsername: "Establecer nombre de usuario",
    setUsernameDesc: "Este será tu nombre permanente y no podrás cambiarlo después",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    setName: "Establecer nombre",
    
    addNewItem: "Agregar nuevo elemento",
    itemName: "Nombre del elemento",
    itemNamePlaceholder: "Ej: Leche",
    backgroundColor: "Color de fondo (opcional)",
    noColor: "Sin color",
    red: "Rojo",
    pink: "Rosa",
    purple: "Morado",
    blue: "Azul",
    green: "Verde",
    yellow: "Amarillo",
    orange: "Naranja",
    add: "Agregar",
    
    enterListCode: "Ingresa el código de la lista",
    enterListCodeDesc: "Comparte para modificar la lista de forma colaborativa",
    listCode: "Código de la lista",
    listCodePlaceholder: "00001",
    join: "Unirse",
    
    deleteListTitle: "¿Eliminar lista?",
    deleteListDesc: "¿Estás seguro de que quieres eliminar la lista \"{name}\"? Esta acción no se puede deshacer y todos los usuarios perderán acceso a ella.",
    delete: "Eliminar",
    
    uncheckAllTitle: "¿Desmarcar todos los elementos?",
    uncheckAllDesc: "Todos los elementos marcados de la lista volverán a estar sin marcar.",
    uncheck: "Desmarcar",
    
    participantsDialog: "Participantes de la lista",
    creator: "Creador",
    remove: "Eliminar",
    noParticipants: "No hay otros participantes en esta lista",
    
    pendingRequestsDialog: "Solicitudes Pendientes",
    loading: "Cargando...",
    noPendingRequests: "No hay solicitudes pendientes",
    approve: "Aprobar",
    reject: "Rechazar",
    
    deleteItem: "Eliminar elemento",
    
    // Notifications
    errorInitApp: "Error al inicializar la aplicación",
    errorCreateList: "Error al crear la lista",
    firebaseNotConfigured: "Firebase no configurado. No se puede unir a listas.",
    alreadyOwner: "Ya eres el propietario de esta lista",
    alreadyParticipant: "Ya eres participante de esta lista",
    alreadyPending: "Ya tienes una solicitud pendiente para esta lista",
    requestSentSuccess: "Solicitud enviada correctamente. Pendiente de aprobación del propietario",
    listCodeNotFound: "Código de lista no encontrado",
    errorJoinList: "Error al unirse a la lista",
    errorUpdateList: "Error al actualizar la lista",
    listDeletedSuccess: "Lista eliminada",
    errorDeleteList: "Error al eliminar la lista",
    errorSetName: "Error al establecer el nombre",
  },
  en: {
    // MainView
    myLists: "My Lists",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    joinList: "Join a list",
    newList: "New List",
    myListsSection: "My Lists",
    sharedListsSection: "Other Users' Lists",
    noListsYet: "You don't have any lists yet. Create a new list or join an existing one.",
    user: "User",
    nameEstablished: "Name established",
    items: "items",
    item: "item",
    
    // ListView
    participants: "Participants",
    pendingRequests: "Pending Requests",
    uncheckAll: "Uncheck all",
    deleteList: "Delete list",
    back: "Back",
    addItem: "Add item",
    emptyList: "There are no items in this list yet",
    editListName: "Edit list name",
    save: "Save",
    close: "Close",
    
    // Dialogs
    createNewList: "Create new list",
    createNewListDesc: "Give your new shopping list a name",
    listName: "List name",
    listNamePlaceholder: "E.g: Monthly Shopping",
    cancel: "Cancel",
    create: "Create",
    
    setUsername: "Set username",
    setUsernameDesc: "This will be your permanent name and you won't be able to change it later",
    name: "Name",
    namePlaceholder: "Your name",
    setName: "Set name",
    
    addNewItem: "Add new item",
    itemName: "Item name",
    itemNamePlaceholder: "E.g: Milk",
    backgroundColor: "Background color (optional)",
    noColor: "No color",
    red: "Red",
    pink: "Pink",
    purple: "Purple",
    blue: "Blue",
    green: "Green",
    yellow: "Yellow",
    orange: "Orange",
    add: "Add",
    
    enterListCode: "Enter list code",
    enterListCodeDesc: "Share to collaboratively edit the list",
    listCode: "List code",
    listCodePlaceholder: "00001",
    join: "Join",
    
    deleteListTitle: "Delete list?",
    deleteListDesc: "Are you sure you want to delete the list \"{name}\"? This action cannot be undone and all users will lose access to it.",
    delete: "Delete",
    
    uncheckAllTitle: "Uncheck all items?",
    uncheckAllDesc: "All checked items in the list will be unchecked.",
    uncheck: "Uncheck",
    
    participantsDialog: "List participants",
    creator: "Creator",
    remove: "Remove",
    noParticipants: "There are no other participants in this list",
    
    pendingRequestsDialog: "Pending Requests",
    loading: "Loading...",
    noPendingRequests: "No pending requests",
    approve: "Approve",
    reject: "Reject",
    
    deleteItem: "Delete item",
    
    // Notifications
    errorInitApp: "Error initializing the application",
    errorCreateList: "Error creating the list",
    firebaseNotConfigured: "Firebase not configured. Cannot join lists.",
    alreadyOwner: "You are already the owner of this list",
    alreadyParticipant: "You are already a participant in this list",
    alreadyPending: "You already have a pending request for this list",
    requestSentSuccess: "Request sent successfully. Pending owner approval",
    listCodeNotFound: "List code not found",
    errorJoinList: "Error joining the list",
    errorUpdateList: "Error updating the list",
    listDeletedSuccess: "List deleted",
    errorDeleteList: "Error deleting the list",
    errorSetName: "Error setting the name",
  },
};

export function useTranslation(language: Language) {
  return translations[language];
}
