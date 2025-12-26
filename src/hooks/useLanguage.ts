import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

type Language = "es" | "en";

const LANGUAGE_KEY = "app_language";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("es");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const { value } = await Preferences.get({ key: LANGUAGE_KEY });
      
      if (value) {
        setLanguage(value as Language);
      } else {
        // Detectar idioma del navegador/dispositivo
        const browserLang = navigator.language.toLowerCase();
        const detectedLang = browserLang.startsWith("en") ? "en" : "es";
        setLanguage(detectedLang);
        await Preferences.set({ key: LANGUAGE_KEY, value: detectedLang });
      }
    } catch (error) {
      // Fallback a localStorage
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored) {
        setLanguage(stored as Language);
      } else {
        const browserLang = navigator.language.toLowerCase();
        const detectedLang = browserLang.startsWith("en") ? "en" : "es";
        setLanguage(detectedLang);
        localStorage.setItem(LANGUAGE_KEY, detectedLang);
      }
    }
  };

  const toggleLanguage = async () => {
    const newLanguage: Language = language === "es" ? "en" : "es";
    setLanguage(newLanguage);
    
    try {
      await Preferences.set({ key: LANGUAGE_KEY, value: newLanguage });
    } catch (error) {
      localStorage.setItem(LANGUAGE_KEY, newLanguage);
    }
  };

  return { language, toggleLanguage };
}
