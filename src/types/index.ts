// Tipos de datos para la aplicación

export interface ListItem {
  id: string;
  text: string;
  color?: string;
  checked: boolean;
}

export interface List {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  sharedWith: string[];
  pendingRequests: string[];
  items: ListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  nameSet: boolean;
  createdAt: Date;
  updatedAt: Date;
}
