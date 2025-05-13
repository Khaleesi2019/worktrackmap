import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "i18next";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check for saved language preference or use browser language
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage) return savedLanguage;
    
    // Check browser language
    const browserLang = navigator.language.split("-")[0].toLowerCase();
    return browserLang === "es" ? "es" : "en";
  });

  useEffect(() => {
    // Change i18next language
    i18n.changeLanguage(language);
    
    // Save language preference to localStorage
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === "en" ? "es" : "en");
  };
  
  // Wrapper for i18n translation function
  const t = (key: string): string => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
