import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Cargar tema guardado o detectar preferencia del sistema
    const loadTheme = async () => {
      try {
        const { value } = await Preferences.get({ key: "theme" });
        
        if (value) {
          // Si hay un tema guardado, usarlo
          const savedTheme = value as Theme;
          setTheme(savedTheme);
          applyTheme(savedTheme);
        } else {
          // Si no hay tema guardado, detectar preferencia del sistema
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme = systemPrefersDark ? "dark" : "light";
          setTheme(systemTheme);
          applyTheme(systemTheme);
        }
      } catch (error) {
        // Fallback a localStorage o preferencia del sistema
        const savedTheme = localStorage.getItem("theme") as Theme;
        
        if (savedTheme) {
          setTheme(savedTheme);
          applyTheme(savedTheme);
        } else {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme = systemPrefersDark ? "dark" : "light";
          setTheme(systemTheme);
          applyTheme(systemTheme);
        }
      }
    };

    loadTheme();
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);

    // Guardar preferencia
    try {
      await Preferences.set({ key: "theme", value: newTheme });
    } catch (error) {
      // Fallback a localStorage
      localStorage.setItem("theme", newTheme);
    }
  };

  return { theme, toggleTheme };
}
