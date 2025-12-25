import { ListItem } from "../types";

// Función para ordenar elementos según las reglas:
// 1. Elementos sin marcar primero, marcados al final
// 2. Por color (alfabético de colores)
// 3. Sin color después de los coloreados
// 4. Dentro de cada grupo por orden alfabético del texto

export function sortItems(items: ListItem[]): ListItem[] {
  return [...items].sort((a, b) => {
    // Primero separar por checked
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1;
    }

    // Dentro del mismo grupo (checked o unchecked), ordenar por color
    const aHasColor = !!a.color;
    const bHasColor = !!b.color;

    if (aHasColor && !bHasColor) return -1;
    if (!aHasColor && bHasColor) return 1;

    // Si ambos tienen color o ambos no tienen color
    if (aHasColor && bHasColor) {
      // Ordenar por color primero
      const colorCompare = a.color!.localeCompare(b.color!);
      if (colorCompare !== 0) return colorCompare;
    }

    // Finalmente ordenar alfabéticamente por texto
    return a.text.localeCompare(b.text, 'es', { sensitivity: 'base' });
  });
}

// Generar código incremental de 5 dígitos
export function generateListCode(): string {
  // Código por defecto si no hay listas previas
  return "00001";
}
