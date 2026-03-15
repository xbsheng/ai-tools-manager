import { createContext, useContext } from "react";
import { en, type TranslationKey } from "./en";
import { zh } from "./zh";

export type Language = "en" | "zh";

const translations: Record<Language, Record<TranslationKey, string>> = { en, zh };

export type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const I18nContext = createContext<TFunction>((key) => en[key]);

export function createT(lang: Language): TFunction {
  const map = translations[lang];
  return (key, params) => {
    let str = map[key] ?? en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}

export function useI18n(): TFunction {
  return useContext(I18nContext);
}

export type { TranslationKey };
