import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { I18nContext, createT, type Language } from "../i18n";

export type Theme = "light" | "dark";

interface SettingsContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  language: "en",
  setLanguage: () => {},
  theme: "dark",
  setTheme: () => {},
});

const LANG_KEY = "atm-lang";
const THEME_KEY = "atm-theme";

function getStored<T extends string>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return (v as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    getStored(LANG_KEY, "en"),
  );
  const [theme, setThemeState] = useState<Theme>(() =>
    getStored(THEME_KEY, "dark"),
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  const t = useMemo(() => createT(language), [language]);

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      <I18nContext.Provider value={t}>{children}</I18nContext.Provider>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
